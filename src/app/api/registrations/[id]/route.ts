import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface Params {
    params: {
        id: string
    }
}

// DELETE /api/registrations/:id - Cancel (delete) a registration (owner or admin)
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = params

        const registration = await prisma.registration.findUnique({
            where: { id },
        })

        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 })
        }

        // Only the owner or admin can cancel
        if (registration.userId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Delete the registration so capacity is freed
        await prisma.registration.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error cancelling registration:", error)
        return NextResponse.json({ error: "Failed to cancel registration" }, { status: 500 })
    }
}
