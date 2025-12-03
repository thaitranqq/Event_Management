import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = params

        // Check if staff has assigned events
        const staff = await prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { assignedEvents: true }
                }
            }
        })

        if (!staff) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 })
        }

        if (staff._count.assignedEvents > 0) {
            return NextResponse.json({
                error: "Cannot delete staff with assigned events. Please remove assignments first."
            }, { status: 400 })
        }

        await prisma.user.delete({ where: { id } })

        return NextResponse.json({ message: "Staff deleted successfully" })

    } catch (error) {
        console.error("Error deleting staff:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
