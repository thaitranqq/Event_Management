import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/reports/overview - Overview statistics
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Get counts
        const [
            totalEvents,
            publishedEvents,
            totalRegistrations,
            totalCheckIns,
            totalUsers,
            totalSpeakers,
            totalVenues,
        ] = await Promise.all([
            prisma.event.count(),
            prisma.event.count({ where: { status: "PUBLISHED" } }),
            prisma.registration.count(),
            prisma.checkIn.count(),
            prisma.user.count(),
            prisma.speaker.count(),
            prisma.venue.count(),
        ])

        // Get events by category
        const eventsByCategory = await prisma.event.groupBy({
            by: ["category"],
            _count: {
                id: true,
            },
        })

        // Get events by status
        const eventsByStatus = await prisma.event.groupBy({
            by: ["status"],
            _count: {
                id: true,
            },
        })

        // Get recent registrations (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const recentRegistrations = await prisma.registration.count({
            where: {
                registeredAt: {
                    gte: sevenDaysAgo,
                },
            },
        })

        // Get top events by registrations
        const topEvents = await prisma.event.findMany({
            select: {
                id: true,
                title: true,
                category: true,
                _count: {
                    select: {
                        registrations: true,
                        checkins: true,
                    },
                },
            },
            orderBy: {
                registrations: {
                    _count: "desc",
                },
            },
            take: 5,
        })

        // Calculate attendance rate
        const attendanceRate =
            totalRegistrations > 0
                ? ((totalCheckIns / totalRegistrations) * 100).toFixed(1)
                : "0"

        return NextResponse.json({
            overview: {
                totalEvents,
                publishedEvents,
                totalRegistrations,
                totalCheckIns,
                totalUsers,
                totalSpeakers,
                totalVenues,
                recentRegistrations,
                attendanceRate: parseFloat(attendanceRate),
            },
            eventsByCategory: eventsByCategory.map((item) => ({
                category: item.category,
                count: item._count.id,
            })),
            eventsByStatus: eventsByStatus.map((item) => ({
                status: item.status,
                count: item._count.id,
            })),
            topEvents,
        })
    } catch (error) {
        console.error("Error fetching reports:", error)
        return NextResponse.json(
            { error: "Failed to fetch reports" },
            { status: 500 }
        )
    }
}
