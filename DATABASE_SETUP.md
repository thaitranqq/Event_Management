# FPT Event Management System - Quick Setup Database Guide

This guide helps you set up PostgreSQL for the FPT Event Management System.

## Option 1: Docker (Recommended for Quick Setup)

The fastest way to get started:

```bash
# Start PostgreSQL in Docker
docker run --name fpt-events-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=fpt_events \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

Your database URL will be:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fpt_events?schema=public"
```

## Option 2: Cloud Database (Free Tier)

### Using Neon.tech
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string
5. Update `.env` file

### Using Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (change mode to "Session")
5. Update `.env` file

### Using Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the DATABASE_URL
5. Update `.env` file

## After Database Setup

Once your database is ready:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Run migrations (creates tables)
npx prisma migrate dev --name init

# 3. Seed database (creates test accounts and sample data)
npx prisma db seed

# 4. (Optional) Open Prisma Studio to view data
npx prisma studio
```

## Test Accounts Created by Seed

After running the seed script, you can login with:

**Admin Account:**
- Email: `admin@fpt.edu.vn`
- Password: `admin123`

**Staff Account:**
- Email: `staff@fpt.edu.vn`
- Password: `staff123`

**Student Account:**
- Email: `student@fpt.edu.vn`
- Password: `student123`

## Troubleshooting

### Connection Error
If you see "Can't reach database server":
- Check if PostgreSQL is running
- Verify the DATABASE_URL in `.env`
- Check firewall/network settings

### Migration Error
If migration fails:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then try again
npx prisma migrate dev --name init
npx prisma db seed
```

### Port Already in Use
If port 5432 is taken:
```bash
# Use a different port
docker run --name fpt-events-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  -d postgres:15

# Update DATABASE_URL to use port 5433
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/fpt_events"
```

## Stopping/Starting Docker Database

```bash
# Stop
docker stop fpt-events-db

# Start again
docker start fpt-events-db

# Remove completely
docker rm -f fpt-events-db
```
