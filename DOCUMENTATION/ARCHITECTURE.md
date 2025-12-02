# Event Management - Architecture & Design

This document provides a concise set of design artifacts for the Event Management project: Feature list, Context Diagram, Use Cases and Activity Diagrams.

---

**Feature List**

- Authentication & Authorization
  - Sign in/out using NextAuth, role-based access: ADMIN, STAFF, STUDENT
- Events
  - Create, Read, Update, Soft-delete (CANCELLED) events (Admin)
  - Hard delete option (Admin) that removes event and cascades deletes
  - Event categories, status, images, capacity, speaker and venue associations
  - Search, filter, pagination
- Speakers & Venues
  - CRUD for speakers and venues (Admin)
  - Speakers and venues referenced by events (onDelete: SetNull)
- Registrations
  - Students can register for events, generate QR code per registration
  - Registration statuses: PENDING / CONFIRMED / CANCELLED
- Check-in
  - Staff/Admin scan QR or manual code to check in attendee
  - Check-in allowed starting 1 hour before event start (configurable)
  - Check-in records and counts per event
- Reports / Dashboard
  - Overview metrics (total registrations, check-ins, rates)
  - Event-specific check-in list (Admin/Staff)
- API and Server
  - Next.js App Router with API routes under `src/app/api/*`
  - Prisma ORM with PostgreSQL as database
  - Role checks performed in server routes (ADMIN/STAFF)

---

**Context Diagram**

ASCII context diagram describing components and external systems:

```
                +----------------------+             +------------------+
                |      Browser /       |             |   External       |
                |    Mobile Clients    |             |   Services       |
                | (Admin / Staff / Stu)|             |  - Auth provider |
                +----------+-----------+             |  - Email / SMS   |
                           |                         +------------------+
                           | HTTPS
                           v
                    +------+------+     Internal API      +----------------+
                    |  Next.js App  |  <--------------->   | Prisma Client  |
                    | (Frontend +   |                     | (DB Client)    |
                    |  API routes)  |                     +-------+--------+
                    +------+--------+                             |
                           |                                      |
                           | SQL / ORM                            |
                           v                                      v
                     +-----------+                       +----------------------+
                     | PostgreSQL|                       |  File Storage (opt)  |
                     |   (DB)    |                       +----------------------+
                     +-----------+
```

Notes:
- The Next.js App hosts both server-rendered pages and API Routes used by the dashboard and public UI.
- Prisma acts as the ORM layer to the PostgreSQL database; certain relations use Cascade or SetNull semantics as defined in `prisma/schema.prisma`.

---

**Key Actors**

- Admin: full access to create/edit/delete events, manage speakers/venues, view all reports.
- Staff: can perform check-ins, view event check-ins and reports.
- Student (Attendee): browse & register for events, view ticket (QR code), and be checked-in.

---

**Use Cases**

1) Create Event (Admin)
   - Actor: Admin
   - Precondition: Authenticated as ADMIN
   - Steps:
     1. Admin opens Create Event form
     2. Admin fills event details (title, desc, dates, capacity, speaker, venue)
     3. Admin saves -> POST /api/events
     4. Server validates, writes event to DB, returns created event
   - Postcondition: Event visible on dashboard (Admin) and on public listing if PUBLISHED

2) Edit Event (Admin)
   - Actor: Admin
   - Steps:
     1. Admin opens Edit page (prefilled)
     2. Admin modifies fields and submits -> PUT /api/events/:id
     3. Server updates DB; client refreshes event detail

3) Register for Event (Student)
   - Actor: Student
   - Steps:
     1. Student selects event and clicks register
     2. Client POSTs to /api/registrations
     3. Server creates registration with status CONFIRMED and unique QR code
     4. Student can view ticket / QR code

4) Check-in Attendee (Staff/Admin)
   - Actor: Staff or Admin
   - Steps:
     1. Staff scans QR or enters code at check-in page
     2. Client POSTs to /api/checkin with qrCode
     3. Server verifies registration and time window, creates check-in record
     4. Response shows check-in success or error (already checked in / too early / event ended)

5) Cancel and Delete Event (Admin)
   - Actor: Admin
   - Steps:
     1. Admin chooses Cancel -> soft sets status CANCELLED via DELETE /api/events/:id
     2. Optionally Admin can Delete Permanently -> DELETE /api/events/:id?hard=true

---

**Activity Diagrams (ASCII)**

1) Registration Flow

```
Student -> [Browse Events]
  ->[Select Event]
    ->(Click Register)
      -> POST /api/registrations
        -> Server: validate capacity
          -> create registration + qrCode
            -> return registration id
              -> Student sees ticket
```

2) Check-in Flow

```
Staff -> [Open Check-in UI]
  -> (Scan QR) -> send qrCode to /api/checkin
    -> Server: lookup registration by qrCode
       if not found -> return error
       else check event times: now >= start - 1h and now <= end
         if not in window -> return "Check-in not available"
         else if already checked in -> return "Already checked in"
         else -> create check-in record -> success
```

3) Edit Event (Admin) Activity

```
Admin -> [Open Edit Form]
  -> Prefill values from GET /api/events/:id
    -> Admin edits values -> Submit
      -> Client converts datetime-local -> ISO
        -> PUT /api/events/:id
          -> Server updates event in DB
            -> Client navigates back to /events/:id and calls router.refresh()
```

---

Appendix / Next steps

- Add PlantUML files if you want PNG/SVG renderings of the diagrams.
- Consider adding a sequence diagram for check-in and registration if you need more detail.
- If you'd like, I can generate PNG/SVG diagrams from these ASCII diagrams using PlantUML and add them to the `DOCUMENTATION/` folder.

Diagrams (PlantUML sources) have been added to `DOCUMENTATION/diagrams/`:

- `context.puml` — Context Diagram
- `usecases.puml` — Use Case Diagram
- `registration_flow.puml` — Registration sequence
- `checkin_flow.puml` — Check-in sequence
- `edit_event_flow.puml` — Edit event sequence

To render these to images locally (requires PlantUML + Java):

```powershell
# from repository root
cd DOCUMENTATION/diagrams
# render PNG
plantuml *.puml
# render SVG
plantuml -tsvg *.puml
```

Or use an online PlantUML renderer or the `plantuml` VS Code extension to preview and export.

---

Document created on: 2025-12-02
