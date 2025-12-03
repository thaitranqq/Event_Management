import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/events/:id/announcements/:announcementId - Update announcement
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; announcementId: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check permissions
        const isAdmin = session.user.role === 'ADMIN'
        const isStaff = session.user.role === 'STAFF'

        if (!isAdmin && !isStaff) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

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
        const { title, content, priority } = body

        const announcement = await prisma.announcement.update({
            where: { id: params.announcementId },
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(priority && { priority }),
            },
        })

        return NextResponse.json({ announcement })
    } catch (error: any) {
        console.error('Error updating announcement:', error)

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
        }

        return NextResponse.json(
            { error: 'Failed to update announcement' },
            { status: 500 }
        )
    }
}

// DELETE /api/events/:id/announcements/:announcementId - Delete announcement
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; announcementId: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check permissions
        const isAdmin = session.user.role === 'ADMIN'
        const isStaff = session.user.role === 'STAFF'

        if (!isAdmin && !isStaff) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

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

        await prisma.announcement.delete({
            where: { id: params.announcementId },
        })

        return NextResponse.json({ message: 'Announcement deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting announcement:', error)

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
        }

        return NextResponse.json(
            { error: 'Failed to delete announcement' },
            { status: 500 }
        )
    }
}
