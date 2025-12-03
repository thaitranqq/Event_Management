import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyNewAnnouncement } from '@/lib/notification'

// GET /api/events/:id/announcements - Get event announcements
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { eventId: params.id },
            orderBy: [
                { priority: 'desc' },
                { publishedAt: 'desc' },
            ],
        })

        return NextResponse.json({ announcements })
    } catch (error) {
        console.error('Error fetching announcements:', error)
        return NextResponse.json(
            { error: 'Failed to fetch announcements' },
            { status: 500 }
        )
    }
}

// POST /api/events/:id/announcements - Create announcement (staff/admin only)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin or staff assigned to event
        const isAdmin = session.user.role === 'ADMIN'
        const isStaff = session.user.role === 'STAFF'

        if (!isAdmin && !isStaff) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // If staff, check assignment
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

        const body = await request.json()
        const { title, content, priority = 'NORMAL' } = body

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            )
        }

        const announcement = await prisma.announcement.create({
            data: {
                eventId: params.id,
                title,
                content,
                priority,
            },
        })

        // Send notifications to registered users
        await notifyNewAnnouncement(params.id, title)

        return NextResponse.json({ announcement }, { status: 201 })
    } catch (error) {
        console.error('Error creating announcement:', error)
        return NextResponse.json(
            { error: 'Failed to create announcement' },
            { status: 500 }
        )
    }
}
