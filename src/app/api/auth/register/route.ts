import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendOTP } from "@/lib/mail"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().refine((email) => email.endsWith("@fpt.edu.vn"), {
        message: "Email must be an @fpt.edu.vn address",
    }),
    password: z.string().min(6),
    studentId: z.string().min(6).max(10).regex(/^[a-zA-Z0-9]+$/, {
        message: "Student ID must be alphanumeric",
    }),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password, studentId } = registerSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            )
        }

        // Check if student ID already exists
        const existingStudentId = await prisma.user.findUnique({
            where: { studentId },
        })

        if (existingStudentId) {
            return NextResponse.json(
                { message: "Student ID already registered" },
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
                studentId,
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
