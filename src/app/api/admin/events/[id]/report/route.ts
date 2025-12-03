import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        registrations: true,
                        checkins: true
                    }
                }
            }
        })

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 })
        }

        // Get all check-ins with staff details
        const checkIns = await prisma.checkIn.findMany({
            where: { eventId: id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, studentId: true }
                },
                checkedInByStaff: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { checkedInAt: "desc" }
        })

        // Group by staff
        const staffStatsMap = new Map()

        // Initialize with "Unknown/Self" for check-ins without staff (e.g. older records)
        staffStatsMap.set("unknown", {
            staff: { id: "unknown", name: "Unknown / Self Check-in", email: "N/A" },
            count: 0,
            checkIns: []
        })

        checkIns.forEach(checkIn => {
            const staffId = checkIn.checkedInByStaff?.id || "unknown"

            if (!staffStatsMap.has(staffId)) {
                staffStatsMap.set(staffId, {
                    staff: checkIn.checkedInByStaff,
                    count: 0,
                    checkIns: []
                })
            }

            const stats = staffStatsMap.get(staffId)
            stats.count++
            stats.checkIns.push({
                user: checkIn.user,
                checkedInAt: checkIn.checkedInAt
            })
        })

        // Calculate time range
        let earliest = null
        let latest = null
        if (checkIns.length > 0) {
            earliest = checkIns[checkIns.length - 1].checkedInAt
            latest = checkIns[0].checkedInAt
        }

        return NextResponse.json({
            event,
            stats: {
                totalRegistrations: event._count.registrations,
                totalCheckIns: event._count.checkins,
                checkInTimeRange: { earliest, latest }
            },
            staffCheckIns: Array.from(staffStatsMap.values()).filter(s => s.count > 0)
        })
    } catch (error) {
        console.error("Error fetching event report:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
