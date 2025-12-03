import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notifyEventStartInOneHour, notifyFeedbackReminder15Min } from '@/lib/notification'

// POST /api/notifications/process - run scheduled notification checks
export async function POST(request: NextRequest) {
    try {
        // Require admin to trigger this endpoint (you can change to an internal token if needed)
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const now = new Date()

        // Window for ~1 hour before start
        const oneHourFromNowStart = new Date(now.getTime() + 60 * 60 * 1000 - 60 * 1000) // 59 minutes
        const oneHourFromNowEnd = new Date(now.getTime() + 60 * 60 * 1000 + 60 * 1000) // 61 minutes

        // Find PUBLISHED events starting in ~1 hour
        const eventsStartingSoon = await prisma.event.findMany({
            where: {
                status: 'PUBLISHED',
                startDate: {
                    gte: oneHourFromNowStart,
                    lte: oneHourFromNowEnd,
                },
            },
            select: { id: true, title: true },
        })

        for (const ev of eventsStartingSoon) {
            // avoid duplicate reminders: check if a similar notification was sent in the last 6 hours
            const already = await prisma.notification.findFirst({
                where: {
                    type: 'EVENT_REMINDER',
                    title: 'Event Starting Soon',
                    message: { contains: ev.title },
                    sentAt: { gte: new Date(now.getTime() - 1000 * 60 * 60 * 6) },
                },
            })

            if (!already) {
                await notifyEventStartInOneHour(ev.id)
            }
        }

        // Window for ~15 minutes before end
        const fifteenFromNowStart = new Date(now.getTime() + 15 * 60 * 1000 - 60 * 1000) // 14 minutes
        const fifteenFromNowEnd = new Date(now.getTime() + 15 * 60 * 1000 + 60 * 1000) // 16 minutes

        const eventsEndingSoon = await prisma.event.findMany({
            where: {
                status: 'PUBLISHED',
                endDate: {
                    gte: fifteenFromNowStart,
                    lte: fifteenFromNowEnd,
                },
            },
            select: { id: true, title: true },
        })

        for (const ev of eventsEndingSoon) {
            const already = await prisma.notification.findFirst({
                where: {
                    type: 'EVENT_REMINDER',
                    title: 'Feedback Reminder',
                    message: { contains: ev.title },
                    sentAt: { gte: new Date(now.getTime() - 1000 * 60 * 60 * 6) },
                },
            })

            if (!already) {
                await notifyFeedbackReminder15Min(ev.id)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error processing scheduled notifications:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
