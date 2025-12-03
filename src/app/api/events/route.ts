import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { EventStatus, EventCategory } from "@prisma/client"

// GET /api/events - List all events with filtering
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)

        const category = searchParams.get("category") as EventCategory | null
        const status = searchParams.get("status") as EventStatus | null
        const search = searchParams.get("search")
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "12")
        const skip = (page - 1) * limit

        const where: any = {}

        // Non-admin users can only see PUBLISHED events
        if (session?.user?.role !== "ADMIN") {
            where.status = EventStatus.PUBLISHED
        } else if (status) {
            where.status = status
        }

        if (category) {
            where.category = category
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ]
        }

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                include: {
                    speaker: {
                        select: {
                            id: true,
                            name: true,
                            title: true,
                            organization: true,
                        },
                    },
                    venue: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            capacity: true,
                        },
                    },
                    _count: {
                        select: {
                            registrations: true,
                            checkins: true,
                        },
                    },
                },
                orderBy: {
                    startDate: "asc",
                },
                skip,
                take: limit,
            }),
            prisma.event.count({ where }),
        ])

        return NextResponse.json({
            events,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("Error fetching events:", error)
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        )
    }
}

// POST /api/events - Create new event (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const body = await request.json()
        const {
            title,
            description,
            category,
            startDate,
            endDate,
            capacity,
            imageUrl,
            status,
            speakerId,
            venueId,
        } = body

        // Validation
        if (!title || !description || !startDate || !endDate || !capacity) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        if (new Date(startDate) >= new Date(endDate)) {
            return NextResponse.json(
                { error: "Start date must be before end date" },
                { status: 400 }
            )
        }

        const event = await prisma.event.create({
            data: {
                title,
                description,
                category: category || EventCategory.OTHER,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                capacity: parseInt(capacity),
                imageUrl,
                status: status || EventStatus.DRAFT,
                speakerId,
                venueId,
                assignedStaff: {
                    create: body.staffIds?.map((staffId: string) => ({
                        staffId
                    }))
                }
            },
            include: {
                speaker: true,
                venue: true,
            },
        })

        return NextResponse.json(event, { status: 201 })
    } catch (error) {
        console.error("Error creating event:", error)
        return NextResponse.json(
            { error: "Failed to create event" },
            { status: 500 }
        )
    }
}
