import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface Params {
    params: {
        id: string
    }
}

// POST /api/checkin - Check in to event
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        // Check if user is staff or admin
        if (!session?.user?.role || !["ADMIN", "STAFF"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const body = await request.json()
        const { qrCode } = body

        if (!qrCode) {
            return NextResponse.json(
                { error: "QR code is required" },
                { status: 400 }
            )
        }

        // Find registration by QR code
        const registration = await prisma.registration.findUnique({
            where: { qrCode },
            include: {
                event: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        studentId: true,
                    },
                },
            },
        })

        if (!registration) {
            return NextResponse.json(
                { error: "Invalid QR code - Registration not found" },
                { status: 404 }
            )
        }

        if (registration.status !== "CONFIRMED") {
            return NextResponse.json(
                { error: "Registration is not confirmed" },
                { status: 400 }
            )
        }

        // Check if event is active (allow check-in 1 hour before event starts)
        const now = new Date()
        const eventStart = new Date(registration.event.startDate)
        const eventEnd = new Date(registration.event.endDate)

        // Allow check-in 1 hour (60 minutes) before event starts
        const checkInWindowStart = new Date(eventStart.getTime() - 60 * 60 * 1000)

        if (now < checkInWindowStart) {
            return NextResponse.json(
                { error: "Check-in not available yet. You can check in 1 hour before the event starts." },
                { status: 400 }
            )
        }

        if (now > eventEnd) {
            return NextResponse.json(
                { error: "Event has already ended" },
                { status: 400 }
            )
        }

        // Check if already checked in
        const existingCheckIn = await prisma.checkIn.findUnique({
            where: {
                userId_eventId: {
                    userId: registration.userId,
                    eventId: registration.eventId,
                },
            },
        })

        if (existingCheckIn) {
            return NextResponse.json(
                {
                    error: "Already checked in",
                    checkedInAt: existingCheckIn.checkedInAt,
                },
                { status: 409 }
            )
        }

        // Create check-in record
        const checkIn = await prisma.checkIn.create({
            data: {
                userId: registration.userId,
                eventId: registration.eventId,
                method: "QR_CODE",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        studentId: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            checkIn,
        })
    } catch (error) {
        console.error("Error creating check-in:", error)
        return NextResponse.json(
            { error: "Failed to process check-in" },
            { status: 500 }
        )
    }
}
