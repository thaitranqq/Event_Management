import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(req: Request, { params }: { params: { id: string, staffId: string } }) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id, staffId } = params

        await prisma.eventStaff.delete({
            where: {
                eventId_staffId: {
                    eventId: id,
                    staffId
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error removing staff assignment:", error)
        return NextResponse.json({ error: "Failed to remove staff assignment" }, { status: 500 })
    }
}
