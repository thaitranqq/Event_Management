import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/venues - List all venues
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search")

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } },
            ]
        }

        const venues = await prisma.venue.findMany({
            where,
            include: {
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        })

        return NextResponse.json({ venues })
    } catch (error) {
        console.error("Error fetching venues:", error)
        return NextResponse.json(
            { error: "Failed to fetch venues" },
            { status: 500 }
        )
    }
}

// POST /api/venues - Create venue (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const body = await request.json()
        const { name, address, capacity, facilities, imageUrl } = body

        if (!name || !address || !capacity) {
            return NextResponse.json(
                { error: "Name, address, and capacity are required" },
                { status: 400 }
            )
        }

        const venue = await prisma.venue.create({
            data: {
                name,
                address,
                capacity: parseInt(capacity),
                facilities: facilities || [],
                imageUrl,
            },
        })

        return NextResponse.json(venue, { status: 201 })
    } catch (error) {
        console.error("Error creating venue:", error)
        return NextResponse.json(
            { error: "Failed to create venue" },
            { status: 500 }
        )
    }
}
