import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = params
        const assignments = await prisma.eventStaff.findMany({
            where: { eventId: id },
            include: {
                staff: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        return NextResponse.json(assignments.map(a => a.staff))
    } catch (error) {
        console.error("Error fetching event staff:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params
        const body = await req.json()
        const { staffId } = body

        if (!staffId) {
            return NextResponse.json({ error: "Staff ID is required" }, { status: 400 })
        }

        // Check if assignment already exists
        const existing = await prisma.eventStaff.findUnique({
            where: {
                eventId_staffId: {
                    eventId: id,
                    staffId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ error: "Staff already assigned to this event" }, { status: 400 })
        }

        await prisma.eventStaff.create({
            data: {
                eventId: id,
                staffId
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error assigning staff:", error)
        return NextResponse.json({ error: "Failed to assign staff" }, { status: 500 })
    }
}
