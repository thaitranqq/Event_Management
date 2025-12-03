import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/departments - List all departments
export async function GET() {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { code: 'asc' },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        })

        return NextResponse.json({ departments })
    } catch (error) {
        console.error('Error fetching departments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch departments' },
            { status: 500 }
        )
    }
}

// POST /api/departments - Create department (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, code, description } = body

        if (!name || !code) {
            return NextResponse.json(
                { error: 'Name and code are required' },
                { status: 400 }
            )
        }

        const department = await prisma.department.create({
            data: {
                name,
                code: code.toUpperCase(),
                description,
            },
        })

        return NextResponse.json({ department }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating department:', error)

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Department with this name or code already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create department' },
            { status: 500 }
        )
    }
}
