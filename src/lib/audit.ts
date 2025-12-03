import { prisma } from './prisma'

/**
 * Log an action to the audit trail
 */
export async function logAction(
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string | null,
    details?: Record<string, any>,
    ipAddress?: string
) {
    try {
        const auditLog = await prisma.auditLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId,
                details: details || {},
                ipAddress,
            },
        })
        return auditLog
    } catch (error) {
        console.error('Error logging audit action:', error)
        // Don't throw - audit logging should not break the main flow
        return null
    }
}

/**
 * Log event creation
 */
export async function logEventCreated(
    userId: string,
    eventId: string,
    eventTitle: string,
    ipAddress?: string
) {
    return logAction(
        userId,
        'EVENT_CREATED',
        'Event',
        eventId,
        { title: eventTitle },
        ipAddress
    )
}

/**
 * Log event update
 */
export async function logEventUpdated(
    userId: string,
    eventId: string,
    changes: Record<string, any>,
    ipAddress?: string
) {
    return logAction(
        userId,
        'EVENT_UPDATED',
        'Event',
        eventId,
        { changes },
        ipAddress
    )
}

/**
 * Log event deletion
 */
export async function logEventDeleted(
    userId: string,
    eventId: string,
    eventTitle: string,
    ipAddress?: string
) {
    return logAction(
        userId,
        'EVENT_DELETED',
        'Event',
        eventId,
        { title: eventTitle },
        ipAddress
    )
}

/**
 * Log user check-in
 */
export async function logCheckIn(
    userId: string,
    eventId: string,
    staffId: string | null,
    method: 'QR_CODE' | 'MANUAL',
    ipAddress?: string
) {
    return logAction(
        staffId || userId,
        'CHECK_IN',
        'CheckIn',
        null,
        {
            userId,
            eventId,
            method,
            performedBy: staffId ? 'staff' : 'self',
        },
        ipAddress
    )
}

/**
 * Log user registration
 */
export async function logRegistration(
    userId: string,
    eventId: string,
    ipAddress?: string
) {
    return logAction(
        userId,
        'REGISTRATION_CREATED',
        'Registration',
        null,
        { userId, eventId },
        ipAddress
    )
}

/**
 * Log registration cancellation
 */
export async function logRegistrationCancelled(
    userId: string,
    eventId: string,
    ipAddress?: string
) {
    return logAction(
        userId,
        'REGISTRATION_CANCELLED',
        'Registration',
        null,
        { userId, eventId },
        ipAddress
    )
}

/**
 * Log user login
 */
export async function logUserLogin(
    userId: string,
    ipAddress?: string
) {
    return logAction(
        userId,
        'USER_LOGIN',
        'User',
        userId,
        {},
        ipAddress
    )
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(
    email: string,
    ipAddress?: string
) {
    return logAction(
        null,
        'LOGIN_FAILED',
        'User',
        null,
        { email },
        ipAddress
    )
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    if (realIp) {
        return realIp
    }

    return undefined
}
