import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface Params {
    params: {
        id: string
    }
}

// GET /api/speakers/[id] - Get speaker details
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = params

        const speaker = await prisma.speaker.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
        })

        if (!speaker) {
            return NextResponse.json({ error: "Speaker not found" }, { status: 404 })
        }

        return NextResponse.json(speaker)
    } catch (error) {
        console.error("Error fetching speaker:", error)
        return NextResponse.json({ error: "Failed to fetch speaker" }, { status: 500 })
    }
}

// PUT /api/speakers/[id] - Update speaker (Admin only)
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params
        const body = await request.json()

        const speaker = await prisma.speaker.update({
            where: { id },
            data: body,
        })

        return NextResponse.json(speaker)
    } catch (error) {
        console.error("Error updating speaker:", error)
        return NextResponse.json({ error: "Failed to update speaker" }, { status: 500 })
    }
}

// DELETE /api/speakers/[id] - Delete speaker (Admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params

        await prisma.speaker.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting speaker:", error)
        return NextResponse.json({ error: "Failed to delete speaker" }, { status: 500 })
    }
}
