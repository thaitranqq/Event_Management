import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EventDetailClient } from "@/components/EventDetailClient"
import { notFound } from "next/navigation"

async function getEvent(id: string, userId?: string) {
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            speaker: true,
            venue: true,
            _count: {
                select: {
                    registrations: true,
                    checkins: true,
                },
            },
        },
    })

    if (!event) return null

    // Check if current user is registered
    let isRegistered = false
    if (userId) {
        const registration = await prisma.registration.findUnique({
            where: {
                userId_eventId: {
                    userId: userId,
                    eventId: id,
                },
            },
        })
        isRegistered = !!registration
    }

    return { ...event, isRegistered }
}

interface PageProps {
    params: {
        id: string
    }
}

export default async function EventDetailPage({ params }: PageProps) {
    const session = await auth()
    const event = await getEvent(params.id, session?.user?.id)

    if (!event) {
        notFound()
    }

    // Non-admin users can only see PUBLISHED events
    if (session?.user?.role !== "ADMIN" && event.status !== "PUBLISHED") {
        notFound()
    }

    return <EventDetailClient event={event} />
}
