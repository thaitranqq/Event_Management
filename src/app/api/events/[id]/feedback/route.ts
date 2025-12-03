import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/events/:id/feedback - Get all feedback for an event
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const feedback = await prisma.eventFeedback.findMany({
            where: { eventId: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
        })

        // Calculate average rating
        const averageRating = feedback.length > 0
            ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
            : 0

        return NextResponse.json({
            feedback,
            averageRating: Math.round(averageRating * 10) / 10,
            totalCount: feedback.length,
        })
    } catch (error) {
        console.error('Error fetching feedback:', error)
        return NextResponse.json(
            { error: 'Failed to fetch feedback' },
            { status: 500 }
        )
    }
}

// POST /api/events/:id/feedback - Submit feedback (requires check-in)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { rating, comment } = body

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            )
        }

        // Check if event exists and has ended
        const event = await prisma.event.findUnique({
            where: { id: params.id },
        })

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        if (event.endDate > new Date()) {
            return NextResponse.json(
                { error: 'Cannot submit feedback before event ends' },
                { status: 400 }
            )
        }

        // Check if user has a CONFIRMED registration
        const registration = await prisma.registration.findUnique({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId: params.id,
                },
            },
        })

        if (!registration || registration.status !== 'CONFIRMED') {
            return NextResponse.json(
                { error: 'You must have a confirmed registration for this event' },
                { status: 403 }
            )
        }

        // Check if user checked in to the event
        const checkIn = await prisma.checkIn.findUnique({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId: params.id,
                },
            },
        })

        if (!checkIn) {
            return NextResponse.json(
                { error: 'You must check in to the event to submit feedback' },
                { status: 403 }
            )
        }

        // Check if feedback already exists
        const existingFeedback = await prisma.eventFeedback.findUnique({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId: params.id,
                },
            },
        })

        if (existingFeedback) {
            return NextResponse.json(
                { error: 'You have already submitted feedback for this event' },
                { status: 409 }
            )
        }

        // Create feedback
        const feedback = await prisma.eventFeedback.create({
            data: {
                userId: session.user.id,
                eventId: params.id,
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        })

        // Update event report with new average rating
        const allFeedback = await prisma.eventFeedback.findMany({
            where: { eventId: params.id },
            select: { rating: true },
        })

        const averageRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length

        await prisma.eventReport.upsert({
            where: { eventId: params.id },
            update: { averageRating },
            create: {
                eventId: params.id,
                averageRating,
                totalRegistrations: 0,
                totalCheckIns: 0,
            },
        })

        return NextResponse.json({ feedback }, { status: 201 })
    } catch (error) {
        console.error('Error submitting feedback:', error)
        return NextResponse.json(
            { error: 'Failed to submit feedback' },
            { status: 500 }
        )
    }
}
