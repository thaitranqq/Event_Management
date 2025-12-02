import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateQRCode } from "@/lib/utils"

// GET /api/registrations - Get user's registrations
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const registrations = await prisma.registration.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                event: {
                    include: {
                        speaker: true,
                        venue: true,
                    },
                },
            },
            orderBy: {
                registeredAt: "desc",
            },
        })

        return NextResponse.json({ registrations })
    } catch (error) {
        console.error("Error fetching registrations:", error)
        return NextResponse.json(
            { error: "Failed to fetch registrations" },
            { status: 500 }
        )
    }
}

// POST /api/registrations - Register for an event
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { eventId } = body

        if (!eventId) {
            return NextResponse.json(
                { error: "Event ID is required" },
                { status: 400 }
            )
        }

        // Check if event exists and is published
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
        })

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 })
        }

        if (event.status !== "PUBLISHED") {
            return NextResponse.json(
                { error: "Event is not available for registration" },
                { status: 400 }
            )
        }

        // Check if event is full
        if (event._count.registrations >= event.capacity) {
            return NextResponse.json(
                { error: "Event is fully booked" },
                { status: 400 }
            )
        }

        // Check if user is already registered
        const existingRegistration = await prisma.registration.findUnique({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId,
                },
            },
        })

        if (existingRegistration) {
            return NextResponse.json(
                { error: "You are already registered for thisEvent" },
                { status: 400 }
            )
        }

        // Create registration
        const qrCode = generateQRCode(session.user.id, eventId)

        const registration = await prisma.registration.create({
            data: {
                userId: session.user.id,
                eventId,
                qrCode,
                status: "CONFIRMED",
            },
            include: {
                event: {
                    include: {
                        speaker: true,
                        venue: true,
                    },
                },
            },
        })

        return NextResponse.json(registration, { status: 201 })
    } catch (error) {
        console.error("Error creating registration:", error)
        return NextResponse.json(
            { error: "Failed to create registration" },
            { status: 500 }
        )
    }
}
