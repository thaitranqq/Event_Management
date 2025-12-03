import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(6),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, otp, newPassword } = resetSchema.parse(body)

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        if (!user.otp || user.otp !== otp) {
            return NextResponse.json({ message: "Invalid OTP" }, { status: 400 })
        }

        if (!user.otpExpires || user.otpExpires < new Date()) {
            return NextResponse.json({ message: "OTP expired" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword, otp: null, otpExpires: null },
        })

        return NextResponse.json({ message: "Password reset successfully" }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 })
        }
        console.error("Reset password error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
