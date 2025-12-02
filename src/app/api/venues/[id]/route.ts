import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface Params {
    params: {
        id: string
    }
}

// GET /api/venues/[id] - Get venue details
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = params

        const venue = await prisma.venue.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
        })

        if (!venue) {
            return NextResponse.json({ error: "Venue not found" }, { status: 404 })
        }

        return NextResponse.json(venue)
    } catch (error) {
        console.error("Error fetching venue:", error)
        return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 })
    }
}

// PUT /api/venues/[id] - Update venue (Admin only)
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params
        const body = await request.json()

        // Ensure capacity is number if provided
        if (body.capacity) {
            body.capacity = parseInt(body.capacity)
        }

        const venue = await prisma.venue.update({
            where: { id },
            data: body,
        })

        return NextResponse.json(venue)
    } catch (error) {
        console.error("Error updating venue:", error)
        return NextResponse.json({ error: "Failed to update venue" }, { status: 500 })
    }
}

// DELETE /api/venues/[id] - Delete venue (Admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params

        await prisma.venue.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting venue:", error)
        return NextResponse.json({ error: "Failed to delete venue" }, { status: 500 })
    }
}
