import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting database seed...')

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10)
    const staffPassword = await bcrypt.hash('staff123', 10)
    const studentPassword = await bcrypt.hash('student123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@fpt.edu.vn' },
        update: {
            emailVerified: new Date(),
            otp: null,
            otpExpires: null,
        },
        create: {
            email: 'admin@fpt.edu.vn',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
            emailVerified: new Date(),
        },
    })

    const staff = await prisma.user.upsert({
        where: { email: 'staff@fpt.edu.vn' },
        update: {
            emailVerified: new Date(),
            otp: null,
            otpExpires: null,
        },
        create: {
            email: 'staff@fpt.edu.vn',
            password: staffPassword,
            name: 'Staff User',
            role: 'STAFF',
            emailVerified: new Date(),
        },
    })

    const student = await prisma.user.upsert({
        where: { email: 'student@fpt.edu.vn' },
        update: {
            emailVerified: new Date(),
            otp: null,
            otpExpires: null,
        },
        create: {
            email: 'student@fpt.edu.vn',
            password: studentPassword,
            name: 'Student User',
            role: 'STUDENT',
            studentId: 'SE160001',
            emailVerified: new Date(),
        },
    })

    console.log('Created users:', { admin, staff, student })

    // Create speakers
    const speakers = await Promise.all([
        prisma.speaker.create({
            data: {
                name: 'Dr. John Smith',
                bio: 'Leading expert in artificial intelligence and machine learning with over 15 years of experience.',
                title: 'Professor of Computer Science',
                organization: 'MIT',
                email: 'john.smith@mit.edu',
            },
        }),
        prisma.speaker.create({
            data: {
                name: 'Jane Doe',
                bio: 'Successful entrepreneur and startup founder. Built and exited 3 tech companies.',
                title: 'CEO',
                organization: 'TechVentures Inc.',
                email: 'jane.doe@techventures.com',
            },
        }),
        prisma.speaker.create({
            data: {
                name: 'Mike Johnson',
                bio: 'Senior software engineer at Google, specializing in distributed systems.',
                title: 'Senior Software Engineer',
                organization: 'Google',
                email: 'mike.j@google.com',
            },
        }),
    ])

    console.log('Created speakers:', speakers.length)

    // Create venues
    const venues = await Promise.all([
        prisma.venue.create({
            data: {
                name: 'Main Auditorium',
                address: 'FPT University, Hoa Lac Hi-Tech Park, Hanoi',
                capacity: 500,
                facilities: ['Projector', 'Sound System', 'Air Conditioning', 'WiFi'],
            },
        }),
        prisma.venue.create({
            data: {
                name: 'Conference Room A',
                address: 'FPT University, Building Alpha, 2nd Floor',
                capacity: 100,
                facilities: ['Whiteboard', 'Projector', 'Video Conferencing', 'WiFi'],
            },
        }),
        prisma.venue.create({
            data: {
                name: 'Innovation Lab',
                address: 'FPT University, Building Beta, 1st Floor',
                capacity: 50,
                facilities: ['Workshop Tools', 'Computers', 'WiFi', '3D Printer'],
            },
        }),
    ])

    console.log('Created venues:', venues.length)

    // Create events
    const now = new Date()
    const events = await Promise.all([
        prisma.event.create({
            data: {
                title: 'AI and Machine Learning Workshop',
                description: 'Learn the fundamentals of AI and ML with hands-on projects and real-world applications.',
                category: 'TECHNOLOGY',
                startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 hours
                capacity: 500,
                status: 'PUBLISHED',
                speakerId: speakers[0].id,
                venueId: venues[0].id,
            },
        }),
        prisma.event.create({
            data: {
                title: 'Startup Entrepreneurship Seminar',
                description: 'Discover how to build and scale a successful startup from idea to exit.',
                category: 'BUSINESS',
                startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
                capacity: 100,
                status: 'PUBLISHED',
                speakerId: speakers[1].id,
                venueId: venues[1].id,
            },
        }),
        prisma.event.create({
            data: {
                title: 'Cloud Computing and DevOps',
                description: 'Master modern cloud infrastructure and DevOps practices used by top tech companies.',
                category: 'TECHNOLOGY',
                startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
                endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // +5 hours
                capacity: 50,
                status: 'PUBLISHED',
                speakerId: speakers[2].id,
                venueId: venues[2].id,
            },
        }),
        prisma.event.create({
            data: {
                title: 'Career Fair 2024',
                description: 'Meet top employers and explore career opportunities in technology and business.',
                category: 'CAREER',
                startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // +6 hours
                capacity: 500,
                status: 'PUBLISHED',
                venueId: venues[0].id,
            },
        }),
        prisma.event.create({
            data: {
                title: 'Web Development Bootcamp',
                description: 'Intensive bootcamp covering React, Next.js, and full-stack development.',
                category: 'WORKSHOP',
                startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
                endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // +8 hours
                capacity: 100,
                status: 'DRAFT',
                speakerId: speakers[2].id,
                venueId: venues[1].id,
            },
        }),
    ])

    console.log('Created events:', events.length)

    // Assign staff to the first event
    await prisma.eventStaff.create({
        data: {
            eventId: events[0].id,
            staffId: staff.id
        }
    })
    console.log(`Assigned staff ${staff.name} to event: ${events[0].title}`)

    console.log('Seed completed successfully!')
    console.log('\nLogin credentials:')
    console.log('Admin: admin@fpt.edu.vn / admin123')
    console.log('Staff: staff@fpt.edu.vn / staff123')
    console.log('Student: student@fpt.edu.vn / student123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
