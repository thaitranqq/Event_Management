import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/speakers - List all speakers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search")

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { organization: { contains: search, mode: "insensitive" } },
            ]
        }

        const speakers = await prisma.speaker.findMany({
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

        return NextResponse.json({ speakers })
    } catch (error) {
        console.error("Error fetching speakers:", error)
        return NextResponse.json(
            { error: "Failed to fetch speakers" },
            { status: 500 }
        )
    }
}

// POST /api/speakers - Create speaker (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const body = await request.json()
        const { name, bio, title, organization, photoUrl, email, phone } = body

        if (!name) {
            return NextResponse.json(
                { error: "Speaker name is required" },
                { status: 400 }
            )
        }

        const speaker = await prisma.speaker.create({
            data: {
                name,
                bio,
                title,
                organization,
                photoUrl,
                email,
                phone,
            },
        })

        return NextResponse.json(speaker, { status: 201 })
    } catch (error) {
        console.error("Error creating speaker:", error)
        return NextResponse.json(
            { error: "Failed to create speaker" },
            { status: 500 }
        )
    }
}
