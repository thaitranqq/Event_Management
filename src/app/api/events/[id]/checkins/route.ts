import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface Params {
    params: {
        id: string
    }
}

// GET /api/events/[id]/checkins - Get event check-ins (Admin/Staff)
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()

        // Check if user is staff or admin
        if (!session?.user?.role || !["ADMIN", "STAFF"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params

        const checkins = await prisma.checkIn.findMany({
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
                checkedInAt: "desc",
            },
        })

        return NextResponse.json({ checkins })
    } catch (error) {
        console.error("Error fetching event check-ins:", error)
        return NextResponse.json(
            { error: "Failed to fetch check-ins" },
            { status: 500 }
        )
    }
}
