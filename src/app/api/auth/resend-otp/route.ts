import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendOTP } from "@/lib/mail"

const resendSchema = z.object({
    email: z.string().email(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email } = resendSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            )
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { message: "Email already verified" },
                { status: 400 }
            )
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await prisma.user.update({
            where: { email },
            data: {
                otp,
                otpExpires,
            },
        })

        await sendOTP(email, otp)

        return NextResponse.json(
            { message: "OTP resent successfully" },
            { status: 200 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Invalid input", errors: error.errors },
                { status: 400 }
            )
        }
        console.error("Resend OTP error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
