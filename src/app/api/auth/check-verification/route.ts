import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const checkSchema = z.object({
    email: z.string().email(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email } = checkSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email },
            select: { emailVerified: true },
        })

        if (!user) {
            return NextResponse.json(
                { verified: true }, // User doesn't exist, not a verification issue
                { status: 200 }
            )
        }

        return NextResponse.json(
            { verified: !!user.emailVerified },
            { status: 200 }
        )
    } catch (error) {
        console.error("Check verification error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
