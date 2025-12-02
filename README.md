# FPT Event Management System

A comprehensive event management platform for FPT University, enabling administrators to manage events, speakers, and venues, while allowing students to register for events, receive QR-coded tickets, and check in seamlessly.

## Features

- **Role-Based Access Control**: Admin, Staff, and Student roles with appropriate permissions
- **Event Management**: Create, edit, and manage university events with categories
- **Speaker & Venue Management**: Maintain databases of speakers and venues
- **Student Registration**: Browse and register for events with capacity management
- **QR Code Tickets**: Automatic QR code generation for event tickets
- **Check-in System**: Staff can scan QR codes to check in attendees
- **Real-time Validation**: Duplicate check-in prevention and event status verification
- **Reporting Dashboard**: Analytics and statistics for event attendance (Coming Soon)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI Components**: Radix UI, shadcn/ui
- **QR Codes**: qrcode.react

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database running locally or remotely

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fpt_events?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this"
```

Replace the DATABASE_URL with your PostgreSQL connection string.

### 3. Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

Seed the database with sample data:

```bash
npx prisma db seed
```

This will create:
- Admin account: `admin@fpt.edu.vn` / `admin123`
- Staff account: `staff@fpt.edu.vn` / `staff123`
- Student account: `student@fpt.edu.vn` / `student123`
- Sample speakers, venues, and events

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Default Login Credentials

### Admin User
- Email: `admin@fpt.edu.vn`
- Password: `admin123`
- Permissions: Full access to all features

### Staff User
- Email: `staff@fpt.edu.vn`
- Password: `staff123`
- Permissions: Event check-in access

### Student User
- Email: `student@fpt.edu.vn`
- Password: `student123`
- Permissions: Browse events, register, view tickets

## Usage Guide

### For Students

1. **Browse Events**: View all published events on the Events page
2. **Register**: Click on an event and click "Register Now"
3. **View Ticket**: Access your QR code ticket from "My Registrations"
4. **Check-in**: Show your QR code at the event entrance

### For Staff

1. **Check-in Attendees**: Navigate to the Check-in page
2. **Scan QR Codes**: Use the manual entry field (camera integration requires HTTPS)
3. **View Recent Check-ins**: Monitor real-time check-in activity

### For Admins

1. **Manage Events**: Create, edit, or cancel events
2. **Manage Speakers**: Add and update speaker information
3. **Manage Venues**: Maintain venue database
4. **View Analytics**: Access reports and statistics (Coming Soon)

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── events/          # Event pages
│   │   ├── registrations/   # Registration & ticket pages
│   │   ├── checkin/         # Check-in scanner
│   │   └── layout.tsx       # Dashboard layout with navbar
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── events/          # Event CRUD
│   │   ├── registrations/   # Registration endpoints
│   │   └── checkin/         # Check-in endpoint
│   ├── login/               # Login page
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   ├── EventCard.tsx
│   ├── Navbar.tsx
│   └── ...
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Utility functions
└── types/                   # TypeScript type definitions
prisma/
├── schema.prisma            # Database schema
└── seed.ts                  # Seed script
```

## API Endpoints

### Events
- `GET /api/events` - List events (with filters)
- `GET /api/events/[id]` - Get event details
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/[id]` - Update event (Admin)
- `DELETE /api/events/[id]` - Cancel event (Admin)

### Registrations
- `GET /api/registrations` - Get user's registrations
- `POST /api/registrations` - Register for event

### Check-in
- `POST /api/checkin` - Check in with QR code (Staff/Admin)

## Database Schema

- **User**: Authentication and role management
- **Event**: Event details with status and capacity
- **Speaker**: Speaker information
- **Venue**: Venue information with facilities
- **Registration**: Event registrations with QR codes
- **CheckIn**: Check-in records

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npx prisma studio    # Open Prisma Studio (database GUI)
```

## Future Enhancements

  - [ ] Camera-based QR scanner
- [ ] Email notifications for tickets
- [ ] Analytics dashboard
- [ ] Event feedback collection
- [ ] Calendar integration
- [ ] Mobile app

## License

This project is for educational purposes as part of FPT University coursework.
