import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

/**
 * Send a notification to a single user
 */
export async function sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string
) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
            },
        })
        return notification
    } catch (error) {
        console.error('Error sending notification:', error)
        throw error
    }
}

/**
 * Send notifications to multiple users
 */
export async function sendBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string
) {
    try {
        const notifications = await prisma.notification.createMany({
            data: userIds.map((userId) => ({
                userId,
                type,
                title,
                message,
            })),
        })
        return notifications
    } catch (error) {
        console.error('Error sending bulk notifications:', error)
        throw error
    }
}

/**
 * Notify user after successful registration
 */
export async function notifyEventRegistered(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true, startDate: true },
    })

    if (!event) return

    return sendNotification(
        userId,
        'REGISTRATION_CONFIRMED',
        'Registration Confirmed',
        `You have successfully registered for "${event.title}". Event starts on ${event.startDate.toLocaleDateString()}.`
    )
}

/**
 * Send reminder to all registered users 24 hours before event
 */
export async function notifyEventReminder(eventId: string) {
    const registrations = await prisma.registration.findMany({
        where: {
            eventId,
            status: 'CONFIRMED',
        },
        select: { userId: true },
    })

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true, startDate: true, venue: { select: { name: true, address: true } } },
    })

    if (!event || registrations.length === 0) return

    const userIds = registrations.map((r) => r.userId)

    return sendBulkNotifications(
        userIds,
        'EVENT_REMINDER',
        'Event Reminder',
        `Reminder: "${event.title}" starts tomorrow at ${event.startDate.toLocaleTimeString()}. Venue: ${event.venue?.name}.`
    )
}

/**
 * Notify registered users that the event will start in ~1 hour
 */
export async function notifyEventStartInOneHour(eventId: string) {
    const registrations = await prisma.registration.findMany({
        where: { eventId, status: 'CONFIRMED' },
        select: { userId: true },
    })

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true, startDate: true, venue: { select: { name: true } } },
    })

    if (!event || registrations.length === 0) return

    const userIds = registrations.map((r) => r.userId)

    return sendBulkNotifications(
        userIds,
        'EVENT_REMINDER',
        'Event Starting Soon',
        `Reminder: "${event.title}" will start in approximately 1 hour at ${event.startDate.toLocaleTimeString()}. Venue: ${event.venue?.name}.`
    )
}

/**
 * Remind registered users to submit feedback when event is about to end (15 minutes)
 */
export async function notifyFeedbackReminder15Min(eventId: string) {
    const registrations = await prisma.registration.findMany({
        where: { eventId, status: 'CONFIRMED' },
        select: { userId: true },
    })

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true, endDate: true },
    })

    if (!event || registrations.length === 0) return

    const userIds = registrations.map((r) => r.userId)

    return sendBulkNotifications(
        userIds,
        'EVENT_REMINDER',
        'Feedback Reminder',
        `"${event.title}" will end in about 15 minutes. Please prepare to submit your feedback after the event.`
    )
}

/**
 * Notify registered users when event is updated
 */
export async function notifyEventUpdated(eventId: string, changes: string) {
    const registrations = await prisma.registration.findMany({
        where: {
            eventId,
            status: 'CONFIRMED',
        },
        select: { userId: true },
    })

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true },
    })

    if (!event || registrations.length === 0) return

    const userIds = registrations.map((r) => r.userId)

    return sendBulkNotifications(
        userIds,
        'EVENT_UPDATED',
        'Event Updated',
        `The event "${event.title}" has been updated. Changes: ${changes}`
    )
}

/**
 * Notify registered users when event is cancelled
 */
export async function notifyEventCancelled(eventId: string, reason?: string) {
    const registrations = await prisma.registration.findMany({
        where: {
            eventId,
            status: 'CONFIRMED',
        },
        select: { userId: true },
    })

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true },
    })

    if (!event || registrations.length === 0) return

    const userIds = registrations.map((r) => r.userId)

    const message = reason
        ? `The event "${event.title}" has been cancelled. Reason: ${reason}`
        : `The event "${event.title}" has been cancelled.`

    return sendBulkNotifications(
        userIds,
        'EVENT_CANCELLED',
        'Event Cancelled',
        message
    )
}

/**
 * Notify user after successful check-in
 */
export async function notifyCheckInSuccess(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true },
    })

    if (!event) return

    return sendNotification(
        userId,
        'CHECK_IN_SUCCESS',
        'Check-in Successful',
        `You have successfully checked in to "${event.title}". Enjoy the event!`
    )
}

/**
 * Notify users about new announcement
 */
export async function notifyNewAnnouncement(eventId: string, announcementTitle: string) {
    const registrations = await prisma.registration.findMany({
        where: {
            eventId,
            status: 'CONFIRMED',
        },
        select: { userId: true },
    })

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true },
    })

    if (!event || registrations.length === 0) return

    const userIds = registrations.map((r) => r.userId)

    return sendBulkNotifications(
        userIds,
        'ANNOUNCEMENT',
        'New Announcement',
        `New announcement for "${event.title}": ${announcementTitle}`
    )
}
