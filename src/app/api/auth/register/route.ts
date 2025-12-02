import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendOTP } from "@/lib/mail"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password } = registerSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpires,
            },
        })

        await sendOTP(email, otp)

        return NextResponse.json(
            { message: "User created successfully. Please verify your email." },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Invalid input", errors: error.errors },
                { status: 400 }
            )
        }
        console.error("Registration error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
