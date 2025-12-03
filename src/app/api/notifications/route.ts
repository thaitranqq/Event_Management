import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const unreadOnly = searchParams.get('unreadOnly') === 'true'

        const skip = (page - 1) * limit

        const where = {
            userId: session.user.id,
            ...(unreadOnly && { isRead: false }),
        }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { sentAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where }),
        ])

        return NextResponse.json({
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        )
    }
}

// POST /api/notifications/mark-read - Mark notification(s) as read
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { notificationIds, markAllAsRead } = body

        if (markAllAsRead) {
            // Mark all user's notifications as read
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    isRead: false,
                },
                data: { isRead: true },
            })

            return NextResponse.json({ message: 'All notifications marked as read' })
        }

        if (!notificationIds || !Array.isArray(notificationIds)) {
            return NextResponse.json(
                { error: 'notificationIds must be an array' },
                { status: 400 }
            )
        }

        // Mark specific notifications as read
        await prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId: session.user.id, // Ensure user owns these notifications
            },
            data: { isRead: true },
        })

        return NextResponse.json({ message: 'Notifications marked as read' })
    } catch (error) {
        console.error('Error marking notifications as read:', error)
        return NextResponse.json(
            { error: 'Failed to mark notifications as read' },
            { status: 500 }
        )
    }
}
