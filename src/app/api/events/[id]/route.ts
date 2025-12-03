import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface Params {
    params: {
        id: string
    }
}

// GET /api/events/[id] - Get event details
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()
        const { id } = params

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                speaker: true,
                venue: true,
                assignedStaff: {
                    select: { staffId: true }
                },
                _count: {
                    select: {
                        registrations: true,
                        checkins: true,
                    },
                },
            },
        })

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 })
        }

        // Non-admin users can only see PUBLISHED events
        if (session?.user?.role !== "ADMIN" && event.status !== "PUBLISHED") {
            return NextResponse.json({ error: "Event not found" }, { status: 404 })
        }

        // Check if current user is registered
        let isRegistered = false
        if (session?.user?.id) {
            const registration = await prisma.registration.findUnique({
                where: {
                    userId_eventId: {
                        userId: session.user.id,
                        eventId: id,
                    },
                },
            })
            isRegistered = !!registration
        }

        // normalize assigned staff ids for the client
        const assignedStaffIds = (event.assignedStaff || []).map((a: any) => a.staffId)

        // remove nested assignedStaff objects from event payload to avoid redundancy
        const { assignedStaff, ...eventWithoutAssigned } = event as any

        return NextResponse.json({ ...eventWithoutAssigned, assignedStaffIds, isRegistered })
    } catch (error) {
        console.error("Error fetching event:", error)
        return NextResponse.json(
            { error: "Failed to fetch event" },
            { status: 500 }
        )
    }
}

// PUT /api/events/[id] - Update event (Admin only)
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params
        const body = await request.json()

        // Extract staffIds if provided and remove from main update payload
        const staffIds: string[] | undefined = body.staffIds
        const updateData = { ...body }
        if (staffIds !== undefined) delete (updateData as any).staffIds

        // Update basic event fields
        const event = await prisma.event.update({
            where: { id },
            data: updateData,
            include: {
                speaker: true,
                venue: true,
            },
        })

        // If staff assignment was provided, sync assignments
        if (Array.isArray(staffIds)) {
            // Get current assignments
            const current = await prisma.eventStaff.findMany({ where: { eventId: id } })
            const currentIds = current.map((c) => c.staffId)

            const toAdd = staffIds.filter((s) => !currentIds.includes(s))
            const toRemove = currentIds.filter((c) => !staffIds.includes(c))

            if (toRemove.length > 0) {
                await prisma.eventStaff.deleteMany({
                    where: { eventId: id, staffId: { in: toRemove } },
                })
            }

            if (toAdd.length > 0) {
                await prisma.eventStaff.createMany({
                    data: toAdd.map((staffId) => ({ eventId: id, staffId })),
                    skipDuplicates: true,
                })
            }
        }

        return NextResponse.json(event)
    } catch (error) {
        console.error("Error updating event:", error)
        return NextResponse.json(
            { error: "Failed to update event" },
            { status: 500 }
        )
    }
}

// DELETE /api/events/[id] - Delete event (Admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params

        // Allow hard delete via query param ?hard=true
        const url = new URL(request.url)
        const hard = url.searchParams.get("hard") === "true"

        if (hard) {
            // Hard delete: remove event and dependent records (registrations/checkins)
            await prisma.event.delete({ where: { id } })
        } else {
            // Soft delete by setting status to CANCELLED
            await prisma.event.update({
                where: { id },
                data: {
                    status: "CANCELLED",
                },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting event:", error)
        return NextResponse.json(
            { error: "Failed to delete event" },
            { status: 500 }
        )
    }
}
