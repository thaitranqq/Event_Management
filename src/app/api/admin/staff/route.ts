import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createStaffSchema = z.object({
    username: z.string().min(2).regex(/^[a-zA-Z0-9.]+$/, "Username must be alphanumeric or dots"),
    name: z.string().min(2),
})

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const staff = await prisma.user.findMany({
            where: { role: "STAFF" },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                _count: {
                    select: { assignedEvents: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(staff)
    } catch (error) {
        console.error("Error fetching staff:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const body = await req.json()
        const { username, name } = createStaffSchema.parse(body)
        const email = `${username}@staff.fpt.edu.vn`

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ error: "Staff account already exists" }, { status: 400 })
        }

        // Generate random 8-char password
        const password = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(password, 10)

        const staff = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "STAFF",
                emailVerified: new Date(),
            }
        })

        return NextResponse.json({
            message: "Staff created successfully",
            staff: {
                id: staff.id,
                name: staff.name,
                email: staff.email,
                password: password // Return raw password so admin can share it
            }
        }, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
        }
        console.error("Error creating staff:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
