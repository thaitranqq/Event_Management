import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/events/:id/report - Get or generate event report
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user has access (admin, staff, or assigned staff)
        const isAdmin = session.user.role === 'ADMIN'
        const isStaff = session.user.role === 'STAFF'

        if (!isAdmin && !isStaff) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // If staff, check if assigned to event
        if (isStaff && !isAdmin) {
            const assignment = await prisma.eventStaff.findFirst({
                where: {
                    eventId: params.id,
                    staffId: session.user.id,
                },
            })

            if (!assignment) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        }

        // Get or create report
        let report = await prisma.eventReport.findUnique({
            where: { eventId: params.id },
            include: {
                event: {
                    select: {
                        title: true,
                        startDate: true,
                        endDate: true,
                        capacity: true,
                        status: true,
                    },
                },
            },
        })

        if (!report) {
            // Generate report
            const [totalRegistrations, totalCheckIns, feedback] = await Promise.all([
                prisma.registration.count({
                    where: { eventId: params.id, status: 'CONFIRMED' },
                }),
                prisma.checkIn.count({
                    where: { eventId: params.id },
                }),
                prisma.eventFeedback.findMany({
                    where: { eventId: params.id },
                    select: { rating: true },
                }),
            ])

            const averageRating = feedback.length > 0
                ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
                : null

            const attendanceRate = totalRegistrations > 0
                ? (totalCheckIns / totalRegistrations) * 100
                : 0

            report = await prisma.eventReport.create({
                data: {
                    eventId: params.id,
                    totalRegistrations,
                    totalCheckIns,
                    attendanceRate,
                    averageRating,
                },
                include: {
                    event: {
                        select: {
                            title: true,
                            startDate: true,
                            endDate: true,
                            capacity: true,
                            status: true,
                        },
                    },
                },
            })
        }

        return NextResponse.json({ report })
    } catch (error) {
        console.error('Error fetching event report:', error)
        return NextResponse.json(
            { error: 'Failed to fetch event report' },
            { status: 500 }
        )
    }
}

// POST /api/events/:id/report/regenerate - Force regenerate report
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Only admin and staff can regenerate
        if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Calculate fresh stats
        const [totalRegistrations, totalCheckIns, feedback] = await Promise.all([
            prisma.registration.count({
                where: { eventId: params.id, status: 'CONFIRMED' },
            }),
            prisma.checkIn.count({
                where: { eventId: params.id },
            }),
            prisma.eventFeedback.findMany({
                where: { eventId: params.id },
                select: { rating: true },
            }),
        ])

        const averageRating = feedback.length > 0
            ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
            : null

        const attendanceRate = totalRegistrations > 0
            ? (totalCheckIns / totalRegistrations) * 100
            : 0

        // Upsert report
        const report = await prisma.eventReport.upsert({
            where: { eventId: params.id },
            update: {
                totalRegistrations,
                totalCheckIns,
                attendanceRate,
                averageRating,
                updatedAt: new Date(),
            },
            create: {
                eventId: params.id,
                totalRegistrations,
                totalCheckIns,
                attendanceRate,
                averageRating,
            },
            include: {
                event: {
                    select: {
                        title: true,
                        startDate: true,
                        endDate: true,
                        capacity: true,
                        status: true,
                    },
                },
            },
        })

        return NextResponse.json({ report })
    } catch (error) {
        console.error('Error regenerating report:', error)
        return NextResponse.json(
            { error: 'Failed to regenerate report' },
            { status: 500 }
        )
    }
}
