import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/departments/:id - Get department details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const department = await prisma.department.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        })

        if (!department) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 })
        }

        return NextResponse.json({ department })
    } catch (error) {
        console.error('Error fetching department:', error)
        return NextResponse.json(
            { error: 'Failed to fetch department' },
            { status: 500 }
        )
    }
}

// PUT /api/departments/:id - Update department (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, code, description } = body

        const department = await prisma.department.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                ...(code && { code: code.toUpperCase() }),
                ...(description !== undefined && { description }),
            },
        })

        return NextResponse.json({ department })
    } catch (error: any) {
        console.error('Error updating department:', error)

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 })
        }

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Department with this name or code already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update department' },
            { status: 500 }
        )
    }
}

// DELETE /api/departments/:id - Delete department (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if department has users
        const userCount = await prisma.user.count({
            where: { departmentId: params.id },
        })

        if (userCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete department with assigned users' },
                { status: 400 }
            )
        }

        await prisma.department.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ message: 'Department deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting department:', error)

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 })
        }

        return NextResponse.json(
            { error: 'Failed to delete department' },
            { status: 500 }
        )
    }
}
