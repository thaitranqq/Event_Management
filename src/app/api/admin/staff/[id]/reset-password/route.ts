import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const paramsSchema = z.object({ id: z.string() })

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        paramsSchema.parse(params)
        const { id } = params

        const staff = await prisma.user.findUnique({ where: { id } })
        if (!staff) {
            return NextResponse.json({ message: "Staff not found" }, { status: 404 })
        }

        if (staff.role !== 'STAFF') {
            return NextResponse.json({ message: "User is not a staff" }, { status: 400 })
        }

        // Generate a temporary password and update staff's password
        const tempPassword = Math.random().toString(36).slice(-10) + "A1!"
        const hashed = await bcrypt.hash(tempPassword, 10)

        await prisma.user.update({ where: { id }, data: { password: hashed } })

        // Return the temporary password to the admin so they can inform the staff.
        return NextResponse.json({ message: "Temporary password generated", tempPassword }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 })
        }
        console.error("Admin reset staff password error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
