import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface Params {
    params: {
        id: string
    }
}

// GET /api/events/[id]/registrations - Get event registrations (Admin/Staff)
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()

        // Check if user is staff or admin
        if (!session?.user?.role || !["ADMIN", "STAFF"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params

        const registrations = await prisma.registration.findMany({
            where: {
                eventId: id,
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
            },
            orderBy: {
                registeredAt: "desc",
            },
        })

        // Get check-in status for each registration
        const registrationsWithCheckIn = await Promise.all(
            registrations.map(async (reg) => {
                const checkIn = await prisma.checkIn.findUnique({
                    where: {
                        userId_eventId: {
                            userId: reg.userId,
                            eventId: id,
                        },
                    },
                })

                return {
                    ...reg,
                    checkedIn: !!checkIn,
                    checkedInAt: checkIn?.checkedInAt,
                }
            })
        )

        return NextResponse.json({ registrations: registrationsWithCheckIn })
    } catch (error) {
        console.error("Error fetching event registrations:", error)
        return NextResponse.json(
            { error: "Failed to fetch registrations" },
            { status: 500 }
        )
    }
}
