import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const changeSchema = z.object({
    email: z.string().email(),
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, oldPassword, newPassword } = changeSchema.parse(body)

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        const match = await bcrypt.compare(oldPassword, user.password)
        if (!match) {
            return NextResponse.json({ message: "Old password is incorrect" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({ where: { email }, data: { password: hashedPassword } })

        return NextResponse.json({ message: "Password changed successfully" }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 })
        }
        console.error("Change password error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
