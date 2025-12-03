import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/notifications/unread-count - Get unread notification count
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const count = await prisma.notification.count({
            where: {
                userId: session.user.id,
                isRead: false,
            },
        })

        return NextResponse.json({ count })
    } catch (error) {
        console.error('Error fetching unread count:', error)
        return NextResponse.json(
            { error: 'Failed to fetch unread count' },
            { status: 500 }
        )
    }
}
