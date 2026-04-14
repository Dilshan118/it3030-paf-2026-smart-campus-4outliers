<![CDATA[<div align="center">

# 📘 Smart Campus Operations Hub
## Software Requirements Specification (SRS)

**Version 1.0** · **April 2026**

---

_A plain-English guide for every team member to understand the complete business process, features, and implementation workflows — from start to finish._

**IT3030 — Programming Applications & Frameworks**  
**Faculty of Computing — SLIIT**

</div>

---

## 📑 Table of Contents

1. [What Is This Document?](#1-what-is-this-document)
2. [The Big Picture — What Are We Building?](#2-the-big-picture--what-are-we-building)
3. [Who Uses This System? (User Roles)](#3-who-uses-this-system-user-roles)
4. [Module A — Facilities & Assets Catalogue](#4-module-a--facilities--assets-catalogue)
5. [Module B — Booking Management](#5-module-b--booking-management)
6. [Module C — Maintenance & Incident Ticketing](#6-module-c--maintenance--incident-ticketing)
7. [Module D — Notifications](#7-module-d--notifications)
8. [Module E — Authentication & Authorization](#8-module-e--authentication--authorization)
9. [How Everything Connects — The Full User Journey](#9-how-everything-connects--the-full-user-journey)
10. [Outstanding Features to Amplify the Project](#10--outstanding-features-to-amplify-the-project)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Who Builds What? — Team Allocation](#12-who-builds-what--team-allocation)
13. [Implementation Timeline](#13-implementation-timeline)
14. [Glossary](#14-glossary)

---

## 1. What Is This Document?

This is a **Software Requirements Specification** written in plain English. No jargon, no fluff.

**Purpose:** So every team member understands:
- What the system does, step by step
- How each module works as a real-world workflow
- What each person needs to build
- What "extra" features will make us stand out

**Read this before writing a single line of code.** If something is unclear, raise it in the group chat. Every team member should be on the same page.

---

## 2. The Big Picture — What Are We Building?

### The Problem

Imagine you're a student at SLIIT. You need to:
- Book a lab for your group project next Tuesday
- Report that the projector in LT-05 is broken
- Know when your booking is approved

Right now, this is probably done through emails, phone calls, or walking to the admin office. It's slow, messy, and nothing is tracked.

### Our Solution

We're building a **single web platform** — the **Smart Campus Operations Hub** — that handles:

1. **Resource Management** — A catalogue of all bookable things on campus (rooms, labs, projectors, cameras)
2. **Booking System** — Request to book a resource, get approved or rejected, no double-bookings
3. **Incident Reporting** — Report broken equipment or facility issues, track repairs
4. **Notifications** — Get alerts when things happen (booking approved, ticket updated)
5. **Access Control** — Login with Google, different people see different things based on their role

### Think of It Like This

```
📱 Student opens the app
   └→ Logs in with Google
   └→ Sees the campus resource catalogue
   └→ Books a meeting room for Thursday 2 PM
   └→ Gets a notification: "Booking Approved ✅"
   └→ Notices the projector is broken in that room
   └→ Creates an incident ticket with a photo
   └→ Gets a notification: "Technician assigned to your ticket"
   └→ Gets another notification: "Issue resolved ✅"
```

That's the whole platform in one flow.

---

## 3. Who Uses This System? (User Roles)

There are **four types of users**. Every person who logs in gets one of these roles. The role decides what they can see and do.

### 👤 USER (Regular User — Students & Staff)

This is the default role. Anyone who logs in gets this.

**What they CAN do:**
- Browse all campus resources (rooms, labs, equipment)
- Search and filter resources by type, location, capacity
- Request a booking for any available resource
- View their own bookings and their status
- Cancel their own pending/approved bookings
- Create incident tickets when something is broken
- Attach photos as evidence to tickets
- Add comments on their own tickets
- Receive notifications about their bookings and tickets
- Set notification preferences

**What they CANNOT do:**
- Create, edit, or delete resources
- Approve or reject anyone's booking
- Assign technicians to tickets
- See other people's bookings or tickets
- Access admin dashboard or analytics

---

### 🔧 TECHNICIAN (Maintenance Staff)

Assigned by an admin. These are the people who physically fix things.

**What they CAN do:**
- Everything a USER can do, PLUS:
- See tickets assigned to them
- Update ticket status (e.g., mark as "In Progress" or "Resolved")
- Add resolution notes explaining what was done
- Add comments on tickets assigned to them

**What they CANNOT do:**
- Approve bookings
- Assign tickets to other technicians
- Access admin panels

---

### 👔 MANAGER (Department/Facility Manager)

A step above regular users. Can manage resources and bookings for their department.

**What they CAN do:**
- Everything a TECHNICIAN can do, PLUS:
- Create, edit, and delete resources
- Approve or reject booking requests (with a reason)
- Assign technicians to tickets
- View all bookings and tickets (not just their own)
- Access the analytics dashboard

**What they CANNOT do:**
- Manage other users' roles
- Access system-level admin settings

---

### 🛡️ ADMIN (System Administrator)

Full control over everything. Usually the IT admin or project coordinator.

**What they CAN do:**
- Everything a MANAGER can do, PLUS:
- Manage all users (view, change roles, deactivate)
- Full control over all resources, bookings, tickets
- Reject tickets with a reason
- Access the full analytics dashboard
- Configure system settings

---

### Role Summary Table

| Action | USER | TECHNICIAN | MANAGER | ADMIN |
|--------|:----:|:----------:|:-------:|:-----:|
| Browse resources | ✅ | ✅ | ✅ | ✅ |
| Create/edit/delete resources | ❌ | ❌ | ✅ | ✅ |
| Create bookings | ✅ | ✅ | ✅ | ✅ |
| Approve/reject bookings | ❌ | ❌ | ✅ | ✅ |
| Create tickets | ✅ | ✅ | ✅ | ✅ |
| Update ticket status | ❌ | ✅ _(assigned only)_ | ✅ | ✅ |
| Assign technicians | ❌ | ❌ | ✅ | ✅ |
| View analytics dashboard | ❌ | ❌ | ✅ | ✅ |
| Manage user roles | ❌ | ❌ | ❌ | ✅ |

---

## 4. Module A — Facilities & Assets Catalogue

### What Is This?

This is the **inventory** of everything on campus that can be booked or needs maintenance. Think of it as a searchable directory.

### Real-World Analogy

Imagine a university website that lists all its rooms and equipment — like a library catalogue, but for physical spaces and devices.

---

### Types of Resources

| Category | Examples |
|----------|----------|
| **Lecture Halls** | LT-01, LT-02, Main Auditorium |
| **Labs** | Computer Lab A, Network Lab, Electronics Lab |
| **Meeting Rooms** | Board Room 1, Discussion Room 3 |
| **Equipment** | Projector #12, DSLR Camera #5, Whiteboard |

### What Information Does Each Resource Have?

Every resource in the system stores:

| Field | What It Means | Example |
|-------|---------------|---------|
| **Name** | Human-readable name | "Computer Lab A" |
| **Type** | Category of resource | LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT |
| **Capacity** | How many people it fits (for rooms) | 120 |
| **Location** | Where it is on campus | "Block C, 3rd Floor" |
| **Description** | Detailed info about the resource | "Equipped with 60 PCs, air-conditioned" |
| **Availability Windows** | When it's generally available | Mon–Fri, 8 AM – 6 PM |
| **Status** | Current operational state | ACTIVE or OUT_OF_SERVICE |
| **Image** | A photo of the resource | Uploaded image file |

### Workflow: How Resources Are Managed

```
ADMIN logs in
  └→ Goes to "Manage Resources" page
  └→ Clicks "Add New Resource"
  └→ Fills in: Name, Type, Capacity, Location, Description
  └→ Uploads a photo of the resource
  └→ Sets availability windows (e.g., Mon–Fri, 8AM–6PM)
  └→ Saves — resource is now ACTIVE and visible to all users
```

```
USER logs in
  └→ Goes to "Resources" page
  └→ Sees a grid/list of all ACTIVE resources
  └→ Uses filters: Type = "Lab", Capacity ≥ 30, Location = "Block C"
  └→ Clicks on a resource to see full details
  └→ Sees availability calendar showing booked/free time slots
  └→ Clicks "Book This Resource" → goes to booking form
```

```
ADMIN notices equipment is broken
  └→ Goes to that resource's page
  └→ Changes status from ACTIVE to OUT_OF_SERVICE
  └→ Resource is no longer available for new bookings
  └→ Existing bookings for that resource are notified
```

### Features to Build

| # | Feature | Priority | Details |
|---|---------|----------|---------|
| A1 | Resource listing page | 🔴 Must | Grid/list view of all resources with pagination |
| A2 | Search & filter | 🔴 Must | Filter by type, capacity, location, status |
| A3 | Resource detail page | 🔴 Must | All info + availability calendar |
| A4 | Create resource (Admin) | 🔴 Must | Form with all fields + image upload |
| A5 | Edit resource (Admin) | 🔴 Must | Pre-filled form to update any field |
| A6 | Delete resource (Admin) | 🔴 Must | Soft delete (mark as deleted, don't remove from DB) |
| A7 | Toggle status (Admin) | 🔴 Must | Switch between ACTIVE and OUT_OF_SERVICE |
| A8 | Availability calendar | 🟡 Should | Visual calendar showing booked slots |
| A9 | Resource image gallery | 🟢 Nice | Multiple photos per resource |
| A10 | CSV bulk import | 🟢 Nice | Upload a CSV to add many resources at once |

### Backend Implementation Plan

**Entity: `Resource`**
```
Fields: id, name, type (enum), capacity, location, description,
        availabilityWindows (JSON), status (enum: ACTIVE/OUT_OF_SERVICE),
        imageUrl, isDeleted, createdAt, updatedAt
```

**Endpoints to build:**
1. `GET /api/v1/resources` → List all (paginated, filtered)
2. `GET /api/v1/resources/{id}` → Get one by ID
3. `POST /api/v1/resources` → Create (Admin only)
4. `PUT /api/v1/resources/{id}` → Update (Admin only)
5. `DELETE /api/v1/resources/{id}` → Soft delete (Admin only)
6. `GET /api/v1/resources/search` → Search with query params
7. `PATCH /api/v1/resources/{id}/status` → Toggle status (Admin only)

**Validation rules:**
- Name is required, 3–100 characters
- Type must be one of the defined enum values
- Capacity must be a positive integer (for rooms)
- Location is required
- Image must be JPG/PNG, max 5MB

### Frontend Implementation Plan

**Pages:**
1. `/resources` → Resource catalogue (grid with filters)
2. `/resources/:id` → Resource detail page
3. `/admin/resources` → Admin CRUD panel
4. `/admin/resources/new` → Create resource form
5. `/admin/resources/:id/edit` → Edit resource form

---

## 5. Module B — Booking Management

### What Is This?

This lets users **request to book a resource** (a room, a lab, equipment) for a specific date and time. An admin/manager reviews and approves or rejects the request.

### Real-World Analogy

Like booking a meeting room on Google Calendar — but with an approval step, and the system prevents double-bookings.

---

### How a Booking Works — Step by Step

**From the User's perspective:**

```
Step 1: USER browses the resource catalogue
Step 2: USER finds "Discussion Room 3" and clicks "Book"
Step 3: USER fills in:
         - Date: April 15, 2026
         - Time: 2:00 PM – 4:00 PM
         - Purpose: "Group project discussion"
         - Expected Attendees: 6
Step 4: System checks: Is the room already booked for that time?
         - If YES → Shows error: "Conflict! Room is booked 1PM–3PM by someone else"
         - If NO → Booking created with status = PENDING
Step 5: USER sees their booking in "My Bookings" with status PENDING ⏳
Step 6: ADMIN sees the pending booking in their review panel
Step 7: ADMIN approves or rejects:
         - Approve → Status changes to APPROVED ✅
         - Reject → Status changes to REJECTED ❌ (admin must give a reason)
Step 8: USER gets a notification about the decision
Step 9: If approved, USER can later CANCEL the booking if plans change
```

### Booking Status Lifecycle

```
                    ┌─────────────────┐
                    │     PENDING     │  ← User creates booking
                    │   (waiting for  │
                    │  admin review)  │
                    └────────┬────────┘
                             │
                    Admin reviews...
                             │
              ┌──────────────┼──────────────┐
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │    APPROVED ✅   │          │   REJECTED ❌    │
    │   (booking is   │          │  (admin gives   │
    │    confirmed)   │          │    a reason)    │
    └────────┬────────┘          └─────────────────┘
             │                         (final)
     User changes mind...
             │
             ▼
    ┌─────────────────┐
    │  CANCELLED 🚫   │
    │  (user or admin │
    │   cancelled it) │
    └─────────────────┘
          (final)
```

### The Conflict Detection Problem (Very Important!)

This is the **hardest part** of Module B and the part that will impress evaluators.

**The Rule:** Two bookings for the **same resource** cannot overlap in time.

**Example:**
```
Existing booking:  Room A, April 15, 2:00 PM – 4:00 PM  (APPROVED)

New request:       Room A, April 15, 3:00 PM – 5:00 PM
                                     ↑
                   This overlaps! (3 PM – 4 PM is already taken)
                   → System should BLOCK this request.

New request:       Room A, April 15, 4:00 PM – 6:00 PM
                   This does NOT overlap (starts exactly when other ends)
                   → System should ALLOW this request.

New request:       Room B, April 15, 2:00 PM – 4:00 PM
                   Different room! No conflict.
                   → System should ALLOW this request.
```

**The Logic (plain English):**

> A new booking conflicts with an existing one if ALL of these are true:
> 1. Same resource
> 2. Same date
> 3. The existing booking's status is PENDING or APPROVED (not rejected/cancelled)
> 4. The new booking's start time is BEFORE the existing booking's end time
> 5. The new booking's end time is AFTER the existing booking's start time

**In code terms:**
```sql
SELECT * FROM bookings
WHERE resource_id = :newResourceId
  AND date = :newDate
  AND status IN ('PENDING', 'APPROVED')
  AND start_time < :newEndTime
  AND end_time > :newStartTime
```

If this query returns any results → there's a conflict → block the booking.

### What Information Does Each Booking Have?

| Field | What It Means | Example |
|-------|---------------|---------|
| **Resource** | What room/equipment is being booked | "Computer Lab A" |
| **User** | Who made the booking | "dilshan@email.com" |
| **Date** | The date of the booking | April 15, 2026 |
| **Start Time** | When the booking starts | 2:00 PM |
| **End Time** | When the booking ends | 4:00 PM |
| **Purpose** | Why they need it | "Group project discussion" |
| **Expected Attendees** | How many people will attend | 6 |
| **Status** | Current state of the booking | PENDING / APPROVED / REJECTED / CANCELLED |
| **Admin Reason** | Why it was rejected (if rejected) | "Room under maintenance" |

### Features to Build

| # | Feature | Priority | Details |
|---|---------|----------|---------|
| B1 | Create booking request | 🔴 Must | Form with resource, date, time range, purpose, attendees |
| B2 | Conflict detection | 🔴 Must | Check for overlapping bookings before creation |
| B3 | My bookings dashboard | 🔴 Must | User sees all their bookings with filters |
| B4 | Booking approval/rejection | 🔴 Must | Admin panel to approve/reject with reason |
| B5 | Cancel booking | 🔴 Must | User or admin can cancel approved bookings |
| B6 | View all bookings (Admin) | 🔴 Must | Admin sees all bookings with filters |
| B7 | Interactive calendar view | 🟡 Should | Shows bookings on a visual calendar |
| B8 | QR code for approved bookings | 🟢 Nice | Generate scannable QR for check-in |
| B9 | Check-in verification screen | 🟢 Nice | Scan QR to verify booking at venue |
| B10 | Booking reminder notifications | 🟢 Nice | Remind user 1 hour before booking |

### Backend Implementation Plan

**Entity: `Booking`**
```
Fields: id, userId (FK→User), resourceId (FK→Resource),
        date, startTime, endTime, purpose, expectedAttendees,
        status (enum: PENDING/APPROVED/REJECTED/CANCELLED),
        adminReason, qrCode, checkedInAt,
        createdAt, updatedAt
```

**Endpoints to build:**
1. `GET /api/v1/bookings` → List bookings (own for USER, all for ADMIN)
2. `GET /api/v1/bookings/{id}` → Get booking details
3. `POST /api/v1/bookings` → Create booking (with conflict check)
4. `PUT /api/v1/bookings/{id}` → Edit booking (only if PENDING)
5. `DELETE /api/v1/bookings/{id}` → Cancel booking
6. `PATCH /api/v1/bookings/{id}/approve` → Approve (Admin)
7. `PATCH /api/v1/bookings/{id}/reject` → Reject with reason (Admin)
8. `GET /api/v1/bookings/{id}/qr` → Get QR code
9. `GET /api/v1/bookings/conflicts` → Check conflicts for a time range

**Validation rules:**
- Date must be today or in the future
- End time must be after start time
- Minimum booking duration: 30 minutes
- Maximum booking duration: 8 hours
- Resource must exist and be ACTIVE
- Purpose is required, 10–500 characters

### Frontend Implementation Plan

**Pages:**
1. `/bookings` → My bookings dashboard
2. `/bookings/new` → Create booking form (with resource selector, date/time picker)
3. `/bookings/:id` → Booking detail (with QR code if approved)
4. `/admin/bookings` → Admin review panel (pending bookings queue)
5. `/bookings/calendar` → Calendar view of bookings

---

## 6. Module C — Maintenance & Incident Ticketing

### What Is This?

When something on campus is broken, damaged, or not working — users can report it through a **ticket**. An admin assigns a technician, and the ticket is tracked from creation to resolution.

### Real-World Analogy

Like creating a support ticket with IT help desk, but for physical things on campus. Think of it like reporting a pothole to the city council — you describe the problem, attach a photo, and someone gets assigned to fix it.

---

### How a Ticket Works — Step by Step

**From the User's perspective:**

```
Step 1: USER notices the projector in LT-05 is broken
Step 2: USER creates a ticket:
         - Resource: "Projector in LT-05"
         - Category: "Equipment Malfunction"
         - Description: "Projector shows no signal. The power light blinks red."
         - Priority: HIGH
         - Contact: "dilshan@my.sliit.lk, +94 77 123 4567"
Step 3: USER attaches 2 photos:
         - Photo 1: Blinking red light on the projector
         - Photo 2: Error message on screen
Step 4: Ticket is created with status = OPEN
Step 5: ADMIN sees the new ticket and assigns Technician Kamal to fix it
         → Status changes to IN_PROGRESS
         → USER gets notification: "Technician assigned to your ticket"
Step 6: Technician Kamal goes and fixes the projector
Step 7: Kamal updates the ticket:
         - Changes status to RESOLVED
         - Adds resolution notes: "Replaced HDMI cable. Tested and working."
         → USER gets notification: "Your ticket has been resolved ✅"
Step 8: ADMIN verifies the fix and closes the ticket
         → Status changes to CLOSED
```

**Alternative path — ticket is rejected:**
```
Step 5b: ADMIN reviews the ticket and decides it's not a valid issue
         → Changes status to REJECTED
         → Provides reason: "This is user error. Hold the remote pointed at sensor."
         → USER gets notification: "Ticket rejected. Reason: ..."
```

### Ticket Status Lifecycle

```
    ┌──────────────┐
    │    OPEN 📋   │  ← User creates ticket
    │  (waiting    │
    │  for admin)  │
    └──────┬───────┘
           │
    Admin reviews...
           │
    ┌──────┴───────┐──────────────────────┐
    ▼                                     ▼
┌──────────────┐               ┌──────────────┐
│ IN_PROGRESS  │               │  REJECTED ❌  │
│    🔧        │               │ (admin gives │
│ (technician  │               │  a reason)   │
│  assigned)   │               └──────────────┘
└──────┬───────┘                    (final)
       │
  Technician fixes...
       │
       ▼
┌──────────────┐
│  RESOLVED ✅  │
│ (tech added  │
│  resolution  │
│   notes)     │
└──────┬───────┘
       │
  Admin verifies...
       │
       ▼
┌──────────────┐
│   CLOSED 🔒  │
│ (confirmed   │
│  fixed)      │
└──────────────┘
     (final)
```

### The Comment System

Tickets have a **comment thread** where users and staff can discuss the issue.

**Rules:**
- Anyone can add comments to a ticket they can see
- You can **edit** your own comments only
- You can **delete** your own comments only
- Admins can delete anyone's comments (moderation)
- Each comment shows: author, content, timestamp
- New comments trigger a notification to the ticket owner

**Example comment thread:**
```
💬 Dilshan (User) — Apr 15, 2:30 PM
"The projector also makes a buzzing noise when plugged in."

💬 Kamal (Technician) — Apr 15, 3:15 PM
"Thanks for the info. I'll check the power unit too."

💬 Kamal (Technician) — Apr 16, 10:00 AM
"Fixed. It was a faulty power cable. Replaced and tested."
```

### Image Attachments

- Users can attach up to **3 images** per ticket
- Accepted formats: JPG, PNG
- Max file size: 5 MB per image
- Used as evidence (photos of damage, error screens, etc.)
- Images are stored on the server and referenced by URL
- Anyone viewing the ticket can see the attachments

### What Information Does Each Ticket Have?

| Field | What It Means | Example |
|-------|---------------|---------|
| **Resource/Location** | What's broken or where | "Projector in LT-05" |
| **Category** | Type of issue | EQUIPMENT_MALFUNCTION, FACILITY_DAMAGE, IT_ISSUE, OTHER |
| **Description** | Detailed explanation | "Projector shows no signal..." |
| **Priority** | How urgent | LOW, MEDIUM, HIGH, CRITICAL |
| **Status** | Current state | OPEN → IN_PROGRESS → RESOLVED → CLOSED |
| **Contact Info** | How to reach the reporter | Email and/or phone number |
| **Assigned To** | The technician handling it | "Kamal (Technician)" |
| **Resolution Notes** | What was done to fix it | "Replaced HDMI cable" |
| **Attachments** | Photo evidence | Up to 3 images |
| **Comments** | Discussion thread | Array of comments |

### Features to Build

| # | Feature | Priority | Details |
|---|---------|----------|---------|
| C1 | Create ticket form | 🔴 Must | Resource, category, description, priority, contact |
| C2 | Image attachment upload | 🔴 Must | Drag-and-drop, max 3 images, preview |
| C3 | Ticket listing dashboard | 🔴 Must | User sees own tickets, admin sees all |
| C4 | Ticket detail view | 🔴 Must | All fields + comment thread + attachments |
| C5 | Update ticket status | 🔴 Must | Technician/Admin can move through lifecycle |
| C6 | Assign technician | 🔴 Must | Admin picks from list of technicians |
| C7 | Add resolution notes | 🔴 Must | Technician explains what was fixed |
| C8 | Comment system | 🔴 Must | Add, edit (own), delete (own) comments |
| C9 | SLA timer | 🟢 Nice | Visual countdown for response/resolution targets |
| C10 | Ticket priority filters | 🟡 Should | Filter by priority, status, category |
| C11 | Ticket history/audit | 🟢 Nice | Shows every status change with timestamp |

### Backend Implementation Plan

**Entity: `Ticket`**
```
Fields: id, userId (FK→User), resourceId (FK→Resource),
        category (enum), description, priority (enum),
        status (enum: OPEN/IN_PROGRESS/RESOLVED/CLOSED/REJECTED),
        contactInfo (JSON), assignedTo (FK→User),
        resolutionNotes, slaDeadline, firstResponseAt,
        resolvedAt, createdAt, updatedAt
```

**Entity: `Comment`**
```
Fields: id, ticketId (FK→Ticket), authorId (FK→User),
        content, createdAt, updatedAt
```

**Entity: `Attachment`**
```
Fields: id, ticketId (FK→Ticket), fileUrl, fileName,
        fileSize, contentType, createdAt
```

**Endpoints to build:**
1. `GET /api/v1/tickets` → List tickets (own for USER, all for ADMIN)
2. `GET /api/v1/tickets/{id}` → Get ticket details with comments & attachments
3. `POST /api/v1/tickets` → Create ticket
4. `PUT /api/v1/tickets/{id}` → Update ticket details (owner only, while OPEN)
5. `PATCH /api/v1/tickets/{id}/status` → Update status (TECHNICIAN, ADMIN)
6. `PATCH /api/v1/tickets/{id}/assign` → Assign technician (ADMIN)
7. `POST /api/v1/tickets/{id}/comments` → Add comment
8. `PUT /api/v1/tickets/{id}/comments/{cid}` → Edit own comment
9. `DELETE /api/v1/tickets/{id}/comments/{cid}` → Delete own comment
10. `POST /api/v1/tickets/{id}/attachments` → Upload image (multipart)
11. `DELETE /api/v1/tickets/{id}/attachments/{aid}` → Remove attachment

### Frontend Implementation Plan

**Pages:**
1. `/tickets` → My tickets dashboard (with status/priority filters)
2. `/tickets/new` → Create ticket form with image upload
3. `/tickets/:id` → Ticket detail (full info, comments, attachments, SLA timer)
4. `/admin/tickets` → Admin panel (assign tech, change status, filter all)

---

## 7. Module D — Notifications

### What Is This?

Whenever something important happens — a booking is approved, a ticket status changes, someone comments on your ticket — the system sends a **notification** to the relevant user.

### Real-World Analogy

Like the notification bell on Facebook, Instagram or any app. You see a red badge with a number, click it, and see what happened.

---

### When Do Notifications Get Triggered?

| Event | Who Gets Notified | Notification Message |
|-------|-------------------|---------------------|
| Booking created | Admin/Manager | "New booking request for [Resource] on [Date]" |
| Booking approved | Booking owner | "Your booking for [Resource] has been approved ✅" |
| Booking rejected | Booking owner | "Your booking for [Resource] was rejected. Reason: ..." |
| Booking cancelled | Admin (if user cancelled) | "[User] cancelled booking for [Resource]" |
| Ticket created | Admin/Manager | "New incident ticket: [Title]" |
| Technician assigned | Ticket owner + Technician | "Technician [Name] assigned to your ticket" |
| Ticket status changed | Ticket owner | "Your ticket status changed to [Status]" |
| New comment on ticket | Ticket owner + assigned tech | "[User] commented on ticket: [Preview]" |
| Ticket resolved | Ticket owner | "Your ticket has been resolved ✅" |
| Ticket closed | Ticket owner + technician | "Ticket [#ID] has been closed" |

### How Notifications Work — User's Perspective

```
USER is using the app
  └→ A red badge "3" appears on the bell icon 🔔 in the header
  └→ USER clicks the bell
  └→ Dropdown shows latest 5 notifications:
       📩 "Your booking for Lab A was approved" — 2 min ago (unread)
       📩 "Technician assigned to your ticket" — 15 min ago (unread)
       📩 "New comment on ticket #42" — 1 hour ago (unread)
       📄 "Booking reminder: Lab A tomorrow 2PM" — 3 hours ago
       📄 "Your ticket #38 has been closed" — yesterday
  └→ USER clicks on a notification
  └→ Taken to the relevant page (booking detail or ticket detail)
  └→ Notification marked as read (no longer bold, badge decreases)
  └→ USER can click "Mark All as Read"
  └→ USER can go to /notifications for full history
```

### Notification Preferences (Bonus Feature)

Users can customize what they receive:

```
USER goes to Settings → Notification Preferences
  └→ Toggle switches for:
       ☑ Booking notifications (approve/reject/cancel)
       ☑ Ticket notifications (status changes)
       ☑ Comment notifications
       ☐ Email notifications (off by default)
  └→ Quiet Hours: Don't send notifications between 10 PM – 7 AM
```

### Features to Build

| # | Feature | Priority | Details |
|---|---------|----------|---------|
| D1 | Notification bell icon with badge | 🔴 Must | Shows unread count in header |
| D2 | Notification dropdown panel | 🔴 Must | Shows latest 5–10 notifications |
| D3 | Mark as read (individual) | 🔴 Must | Click to mark one notification read |
| D4 | Mark all as read | 🔴 Must | One button to clear all unread |
| D5 | Full notification history page | 🔴 Must | Paginated list of all notifications |
| D6 | Auto-trigger on events | 🔴 Must | Backend creates notifications on booking/ticket events |
| D7 | Click to navigate | 🟡 Should | Clicking notification goes to relevant page |
| D8 | Real-time via WebSocket | 🟢 Nice | Live updates without page refresh |
| D9 | Notification preferences | 🟢 Nice | Toggle categories, email, quiet hours |
| D10 | Email notifications | 🟢 Nice | Send email for critical events |

### Backend Implementation Plan

**Entity: `Notification`**
```
Fields: id, userId (FK→User), type (enum),
        title, message, referenceId, referenceType,
        isRead (boolean), createdAt
```

**Entity: `NotificationPreference`**
```
Fields: id, userId (FK→User),
        bookingEnabled (bool), ticketEnabled (bool),
        commentEnabled (bool), emailEnabled (bool),
        quietHoursStart (time), quietHoursEnd (time)
```

**Endpoints to build:**
1. `GET /api/v1/notifications` → List user's notifications (paginated)
2. `GET /api/v1/notifications/unread-count` → Count of unread
3. `PATCH /api/v1/notifications/{id}/read` → Mark one as read
4. `PATCH /api/v1/notifications/read-all` → Mark all as read
5. `DELETE /api/v1/notifications/{id}` → Delete notification
6. `GET /api/v1/notifications/preferences` → Get preferences
7. `PUT /api/v1/notifications/preferences` → Update preferences
8. WebSocket: `/ws/notifications` → Real-time push

**How notifications are created (service layer):**
- The BookingService, TicketService, and CommentService call `NotificationService.create()` when relevant events happen
- NotificationService checks user preferences before creating
- If WebSocket is connected, pushes immediately
- If email is enabled, queues an email via Spring Mail

### Frontend Implementation Plan

**Components:**
1. `<NotificationBell />` → In the global header, shows badge
2. `<NotificationDropdown />` → Dropdown with recent notifications
3. `/notifications` → Full history page
4. `/settings/notifications` → Preferences page

---

## 8. Module E — Authentication & Authorization

### What Is This?

This controls **who can log in** and **what they're allowed to do**. We use Google Sign-In so users don't need to create a new username/password.

### Real-World Analogy

Like logging into any app with "Continue with Google" — but after you log in, the system checks your role to decide what menu items and pages you see.

---

### How Login Works — Step by Step

```
Step 1: USER visits the app → sees the Login page
Step 2: USER clicks "Sign in with Google"
Step 3: Browser redirects to Google's login page
Step 4: USER enters their Google credentials (or is already logged in)
Step 5: Google redirects back to our app with a temporary code
Step 6: Our backend exchanges that code for the user's Google profile info:
         - Name: "Dilshan Rajapakshe"
         - Email: "dilshan@my.sliit.lk"
         - Profile picture URL
Step 7: Backend checks: Does this email exist in our database?
         - If NO → Create a new user with role = USER (first-time login)
         - If YES → Fetch existing user record
Step 8: Backend creates a JWT (JSON Web Token) — a signed "ticket" that proves
         who the user is. This token contains:
         - User ID
         - Email
         - Role
         - Expiry time (e.g., 24 hours)
Step 9: Backend sends the JWT to the frontend
Step 10: Frontend stores the JWT (in memory or secure cookie)
Step 11: Every subsequent API request includes the JWT in the header:
          Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Step 12: Backend verifies the JWT on every request:
          - Is it expired? → 401 Unauthorized
          - Is the role allowed for this endpoint? → 403 Forbidden
          - All good? → Process the request
```

### How Authorization Works — Frontend Route Protection

```
Frontend routing:

/login                → Public (anyone can see)
/resources            → Protected (must be logged in)
/bookings             → Protected (must be logged in)
/bookings/new         → Protected (must be logged in)
/tickets              → Protected (must be logged in)
/admin/resources      → Protected + Role check (MANAGER or ADMIN only)
/admin/bookings       → Protected + Role check (MANAGER or ADMIN only)
/admin/tickets        → Protected + Role check (MANAGER or ADMIN only)
/admin/users          → Protected + Role check (ADMIN only)
/admin/analytics      → Protected + Role check (MANAGER or ADMIN only)
```

**If a USER tries to access `/admin/*`:**
- The frontend route guard checks their role
- If not authorized → redirect to `/` or show "Access Denied" page

### How Authorization Works — Backend Endpoint Protection

Every controller endpoint has a security annotation:

```
@PreAuthorize("hasRole('ADMIN')")          → Only ADMIN
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")  → ADMIN or MANAGER
@PreAuthorize("isAuthenticated()")          → Any logged-in user
(no annotation)                             → Public
```

### Features to Build

| # | Feature | Priority | Details |
|---|---------|----------|---------|
| E1 | Google OAuth2 login | 🔴 Must | "Sign in with Google" button |
| E2 | JWT generation & validation | 🔴 Must | Secure token for every request |
| E3 | Role-based endpoint security | 🔴 Must | Spring Security annotations |
| E4 | Frontend route guards | 🔴 Must | Redirect unauthorized users |
| E5 | User profile page | 🔴 Must | View & edit name, profile pic |
| E6 | Admin user management | 🔴 Must | List users, change roles |
| E7 | Token refresh | 🟡 Should | Auto-refresh before expiry |
| E8 | Logout (invalidate token) | 🔴 Must | Clear session, redirect to login |
| E9 | "Access Denied" page | 🟡 Should | Friendly error for unauthorized |
| E10 | Session timeout handling | 🟢 Nice | Auto-logout after inactivity |

### Backend Implementation Plan

**Entity: `User`**
```
Fields: id, email, name, avatarUrl,
        role (enum: USER/TECHNICIAN/MANAGER/ADMIN),
        provider ("google"), providerId (Google's unique ID),
        isActive (boolean), createdAt, updatedAt
```

**Endpoints to build:**
1. `GET /api/v1/auth/login` → Redirect to Google OAuth2
2. `GET /api/v1/auth/callback` → Handle Google callback, create JWT
3. `POST /api/v1/auth/refresh` → Refresh JWT
4. `POST /api/v1/auth/logout` → Invalidate token
5. `GET /api/v1/users/me` → Get current user profile
6. `PUT /api/v1/users/me` → Update profile
7. `GET /api/v1/admin/users` → List all users (Admin)
8. `PATCH /api/v1/admin/users/{id}/role` → Change user role (Admin)

**Spring Security config:**
```
Security filter chain:
  1. CORS filter → allow frontend origin
  2. JWT filter → extract & validate token from Authorization header
  3. Role filter → check @PreAuthorize annotations
  4. OAuth2 login → handle Google callback

Public endpoints (no auth required):
  - /api/v1/auth/**
  - /oauth2/**

Protected endpoints (auth required):
  - Everything else
```

### Frontend Implementation Plan

**Pages:**
1. `/login` → Google sign-in button
2. `/profile` → User profile (view/edit)
3. `/admin/users` → User management (Admin)

**Components:**
1. `<ProtectedRoute />` → Wrapper to check auth before rendering
2. `<RoleGuard role="ADMIN" />` → Check specific role
3. `<AuthProvider />` → Context provider for auth state

---

## 9. How Everything Connects — The Full User Journey

Here's a complete walkthrough that touches every module:

### Scenario: Student "Anjali" and Technician "Kamal"

```
── DAY 1: MONDAY MORNING ──────────────────────────────────────────

1. Anjali opens the Smart Campus Hub in her browser
2. She clicks "Sign in with Google" → logs in with her SLIIT email
   [Module E: Auth]

3. She's now on the Dashboard → she sees:
   - Quick stats (her active bookings, pending tickets)
   - Recent notifications
   [Modules B, C, D]

4. She needs Computer Lab A for her group project on Wednesday
5. She clicks "Resources" in the sidebar
6. She filters: Type = "Lab", Location = "Block C"
7. She sees Lab A is ACTIVE and clicks on it
   [Module A: Resources]

8. She sees the availability calendar — Wednesday 2 PM–4 PM is free
9. She clicks "Book This Resource" → fills the form:
   - Date: Wednesday
   - Time: 2:00 PM – 4:00 PM
   - Purpose: "Group project: Smart Campus presentation prep"
   - Attendees: 5
10. System checks for conflicts → None found → Booking created (PENDING)
    [Module B: Bookings]

── DAY 1: MONDAY AFTERNOON ────────────────────────────────────────

11. Admin "Nisal" logs in → sees 3 pending bookings in the review panel
12. He approves Anjali's booking → status changes to APPROVED
13. Anjali receives a notification: "Your booking for Computer Lab A approved ✅"
    [Module D: Notifications]

── DAY 2: WEDNESDAY ────────────────────────────────────────────────

14. Anjali arrives at Computer Lab A at 2 PM
15. She scans the QR code on her phone at the entrance → Check-in confirmed
    [Module B: QR Innovation]

16. During her session, she notices Monitor #12 has a cracked screen
17. She creates a ticket:
    - Resource: "Monitor #12 in Computer Lab A"
    - Category: "Equipment Damage"
    - Priority: HIGH
    - Description: "Screen is cracked on the left side, display distorted"
    - Attaches 2 photos of the cracked screen
    [Module C: Tickets]

── DAY 2: WEDNESDAY EVENING ────────────────────────────────────────

18. Admin Nisal sees the new ticket → assigns Technician Kamal
19. Anjali gets notification: "Technician Kamal assigned to your ticket"
20. Kamal gets notification: "You've been assigned to ticket #56"
    [Module D: Notifications]

21. Kamal adds a comment: "I'll check this tomorrow morning"
22. Anjali gets notification: "New comment on ticket #56"
    [Module C: Comments → Module D: Notifications]

── DAY 3: THURSDAY ────────────────────────────────────────────────

23. Kamal goes to Lab A → replaces Monitor #12
24. Kamal updates the ticket:
    - Status: RESOLVED
    - Resolution notes: "Replaced with new monitor. Old one sent for disposal."
25. Anjali gets notification: "Your ticket #56 has been resolved ✅"
    [Module C: Tickets → Module D: Notifications]

26. Admin Nisal verifies → closes the ticket
27. Ticket #56 is now CLOSED — full audit trail preserved
    [Module C: Final Status]

── ADMIN VIEW ─────────────────────────────────────────────────────

28. Nisal opens the Analytics Dashboard → sees:
    - Computer Lab A is the most booked resource this month
    - Peak booking time: 2 PM – 4 PM on weekdays
    - Average ticket resolution time: 18 hours
    - 12 tickets resolved this month, 2 pending
    [Innovation: Analytics Dashboard]
```

---

## 10. 🚀 Outstanding Features to Amplify the Project

These are **extra features** beyond the minimum requirements. Implementing even 3–4 of these will make the project significantly better than others.

### 🏆 Tier 1 — High Impact, Moderate Effort

These will definitely impress evaluators:

---

#### 1. 📊 Admin Analytics Dashboard

**What:** A visual dashboard for admins showing platform usage stats with interactive charts.

**Why it stands out:** Shows you can work with data visualization and aggregation queries — not just CRUD.

**What to show:**
- **Top 5 Most Booked Resources** — horizontal bar chart
- **Booking Trends** — line chart showing bookings per day/week/month
- **Peak Hours Heatmap** — which days and times have the most bookings
- **Ticket Resolution Metrics** — average time from OPEN to RESOLVED
- **Ticket Backlog** — current open vs. closed tickets (pie chart)
- **User Activity** — most active users, new sign-ups
- **Resource Utilization Rate** — % of available time that's actually booked

**Backend:** Create an `AnalyticsService` with aggregation queries:
```sql
-- Top booked resources
SELECT r.name, COUNT(b.id) FROM bookings b
JOIN resources r ON b.resource_id = r.id
WHERE b.status = 'APPROVED'
GROUP BY r.name ORDER BY COUNT(b.id) DESC LIMIT 5;
```

**Frontend:** Use **Chart.js** or **Recharts** library for visualizations.

**Pages:** `/admin/analytics` → Dashboard with multiple chart cards

---

#### 2. 📱 QR Code Check-In System

**What:** When a booking is approved, generate a unique QR code. The user shows this QR at the venue, and a simple check-in page verifies it.

**Why it stands out:** Real-world applicability, shows you can work with external libraries.

**How it works:**
1. When booking is approved → backend generates a QR code (encoded booking ID + secret hash)
2. User opens their booking → sees the QR code on screen
3. At the venue, there's a simple `/check-in` page
4. Someone scans the QR → page shows: "✅ Valid booking. Dilshan, Lab A, 2PM–4PM"
5. System logs the check-in time

**Libraries:**
- Backend: `com.google.zxing:core` (QR generation)
- Frontend: `react-qr-code` (display) + camera scan library

---

#### 3. ⏱️ SLA Timer for Tickets

**What:** Each ticket has a target response time (first response within 4 hours) and resolution time (resolve within 24 hours). A visual countdown shows how much time is left.

**Why it stands out:** Shows you understand real-world service management, not just status tracking.

**How it works:**
1. Ticket created → SLA deadline is calculated (created_at + target hours)
2. Ticket detail page shows a countdown timer:
   - 🟢 Green: Plenty of time left (>50% remaining)
   - 🟡 Yellow: Getting close (<50% remaining)
   - 🔴 Red: SLA breached! (time exceeded)
3. When SLA is about to breach → send urgent notification to admin

**SLA Targets (configurable):**
| Priority | First Response | Resolution |
|----------|---------------|------------|
| CRITICAL | 1 hour | 4 hours |
| HIGH | 4 hours | 24 hours |
| MEDIUM | 8 hours | 48 hours |
| LOW | 24 hours | 72 hours |

---

#### 4. 🌙 Dark/Light Theme Toggle

**What:** Full application theme support. User can switch between light and dark mode. Preference is saved.

**Why it stands out:** Shows attention to UX and modern design standards.

**How it works:**
- Toggle button in the header (sun/moon icon)
- CSS custom properties (variables) for all colors
- Preference saved to `localStorage`
- Respects system preference via `prefers-color-scheme` media query
- Smooth transition animation between themes

---

#### 5. 🔔 Real-Time WebSocket Notifications

**What:** Instead of polling the server every few seconds, use WebSocket for instant push notifications.

**Why it stands out:** Shows you understand real-time communication, not just request-response.

**How it works:**
1. When user logs in → frontend opens a WebSocket connection to `/ws/notifications`
2. Backend sends notification events through the socket in real-time
3. Frontend updates the notification badge instantly — no page refresh needed
4. If connection drops → auto-reconnect with exponential backoff

**Backend:** Spring WebSocket with STOMP protocol
**Frontend:** SockJS + STOMP client

---

### 🥈 Tier 2 — Medium Impact, Lower Effort

Good additions that are relatively easy to implement:

---

#### 6. 🔍 Global Search

**What:** A search bar in the header that searches across resources, bookings, and tickets simultaneously.

**How:** Hit a `/api/v1/search?q=projector` endpoint that queries across all entities and returns unified results.

---

#### 7. 📧 Email Notifications

**What:** For critical events (booking approved/rejected, SLA breach), also send an email.

**How:** Use Spring Mail with Gmail SMTP. Queue emails asynchronously so they don't slow down the API response.

---

#### 8. 📅 Booking Reminders

**What:** Send a notification 1 hour before the booking starts: "Reminder: You have a booking at Lab A in 1 hour."

**How:** Use Spring's `@Scheduled` annotation to run a job every 15 minutes that checks for upcoming bookings.

---

#### 9. 📤 Export to CSV/PDF

**What:** Admin can export bookings list or tickets list as CSV or PDF for reporting.

**How:** Backend endpoint returns `Content-Type: text/csv` or use iText library for PDF generation.

---

#### 10. 🗺️ Campus Map View

**What:** Instead of a text list of locations, show resources on an interactive campus map.

**How:** Use a simple SVG campus map with clickable zones, or embed a custom leaflet.js map.

---

### 🥉 Tier 3 — Nice to Have, If Time Allows

These are cherry-on-top features:

---

#### 11. 📊 Resource Comparison

**What:** Side-by-side comparison of 2–3 resources (capacity, features, availability) to help users choose.

---

#### 12. 📱 PWA Support (Progressive Web App)

**What:** Add a `manifest.json` and service worker so the app can be "installed" on mobile home screens and works offline (for viewing cached data).

---

#### 13. 🔄 Recurring Bookings

**What:** Create weekly recurring bookings (e.g., "Book Lab A every Tuesday 2–4 PM for 8 weeks").

**How:** When creating a booking, add a "Recurring" option with frequency (weekly, biweekly) and end date. Backend creates multiple individual bookings.

---

#### 14. ⭐ Resource Ratings & Reviews

**What:** After a booking, users can rate the resource (1–5 stars) and leave a review. Resources show average rating.

---

#### 15. 🏷️ Tagging System for Tickets

**What:** Add tags like "electrical", "plumbing", "IT" to tickets for better categorization. Admins can create custom tags.

---

#### 16. 📋 Saved/Favorite Resources

**What:** Users can "favorite" resources for quick booking access. Shows in a "Favorites" section on their dashboard.

---

#### 17. 🔒 Two-Factor Authentication

**What:** Optional 2FA using authenticator app for admin accounts for extra security.

---

#### 18. 📊 User Activity Log

**What:** Each user can see their own activity history (bookings made, tickets created, logins).

---

### Feature Priority Summary

| Priority | Count | What |
|----------|-------|------|
| 🔴 **Must Have** | ~35 features | Everything in Modules A–E core features |
| 🟡 **Should Have** | ~8 features | Calendar views, filters, better UX |
| 🟢 **Nice to Have** | ~18 features | All outstanding features above |

**Recommendation:** Implement all 🔴 and 🟡. Then pick **at least 4–5** from 🟢 (prioritize Tier 1). This will put you well above average.

---

## 11. Non-Functional Requirements

These aren't features — they're quality standards the system must meet.

### Security
- All passwords and secrets stored via environment variables (never hardcoded)
- JWT tokens expire after 24 hours
- Inputs are validated and sanitized (prevent SQL injection, XSS)
- File uploads validated (type check, size limit, virus scan if possible)
- HTTPS in production
- CORS configured to allow only the frontend origin
- Rate limiting on login endpoint to prevent brute force

### Performance
- API responses < 500ms under normal load
- Database queries optimized with proper indexing
- Pagination on all list endpoints (default 20 per page)
- Image files compressed before storage
- React lazy loading for non-critical pages

### Usability
- Responsive design — works on desktop, tablet, and mobile
- Loading spinners for all async operations
- Meaningful error messages (not "Internal Server Error")
- Empty states — show helpful messages when no data exists
- Breadcrumb navigation on nested pages
- Keyboard accessible (tab navigation, Enter to submit)

### Reliability
- Global exception handler catches all errors
- Database transactions for multi-step operations (e.g., approve booking + create notification)
- Input validation with clear error messages per field
- 404 pages for invalid routes

### Maintainability
- Clean layered architecture (Controller → Service → Repository)
- DTOs for request/response (never expose entities directly)
- Consistent naming conventions across the codebase
- Code comments on complex business logic
- README with setup instructions

---

## 12. Who Builds What? — Team Allocation

### Member 1 — Facilities & Assets Catalogue

**Backend responsibilities:**
- `Resource` entity + `ResourceRepository` + `ResourceService` + `ResourceController`
- Search & filter logic with JPA Specifications
- File upload for resource images
- Unit tests for resource service

**Frontend responsibilities:**
- Resource catalogue page (grid/list toggle)
- Resource detail page with availability display
- Admin resource management (create/edit/delete forms)
- Search and filter UI components

**Minimum endpoints: 7** (GET list, GET one, POST, PUT, DELETE, GET search, PATCH status)

---

### Member 2 — Booking Management

**Backend responsibilities:**
- `Booking` entity + `BookingRepository` + `BookingService` + `BookingController`
- **Conflict detection algorithm** (this is your most important piece)
- Booking approval/rejection logic
- QR code generation (if implementing)
- Unit tests for booking service (especially conflict detection)

**Frontend responsibilities:**
- Booking creation form with resource selector + date/time picker
- My bookings dashboard with status filtering
- Admin booking review panel
- Calendar view (if implementing)
- QR code display (if implementing)

**Minimum endpoints: 9** (GET list, GET one, POST, PUT, DELETE, PATCH approve, PATCH reject, GET QR, GET conflicts)

---

### Member 3 — Maintenance & Incident Ticketing

**Backend responsibilities:**
- `Ticket`, `Comment`, `Attachment` entities + repositories + services + controllers
- Ticket status transition logic (validate allowed transitions)
- Multipart file upload handling for attachments (max 3 images)
- Comment ownership enforcement (edit/delete own only)
- Unit tests for ticket service

**Frontend responsibilities:**
- Ticket creation form with drag-and-drop image upload and preview
- Ticket detail page with comments thread and attachments gallery
- Ticket listing with status/priority/category filters
- SLA timer component (if implementing)

**Minimum endpoints: 11** (tickets CRUD + status + assign + comments CRUD + attachments)

---

### Member 4 — Notifications + Authentication & Authorization

**Backend responsibilities:**
- `User`, `Notification`, `NotificationPreference` entities + repositories + services
- Google OAuth2 integration + JWT token generation/validation
- Spring Security configuration (filter chain, role-based access)
- NotificationService that other modules call to create notifications
- WebSocket setup (if implementing real-time)
- Unit tests for auth and notification services

**Frontend responsibilities:**
- Login page with Google sign-in
- Protected route wrapper component
- Notification bell component + dropdown + full history page
- Admin user management page
- Analytics dashboard page (if implementing)
- Theme toggle (if implementing)

**Minimum endpoints: 11** (auth 4 + users 4 + notifications 7)

---

### Integration Points (Team Coordination Needed!)

These are the places where modules touch each other. **Discuss these early.**

| Integration | Between | What Needs to Happen |
|-------------|---------|---------------------|
| Booking → Resource | Member 2 uses Member 1's resource data | Member 2 needs `ResourceRepository` to validate resource exists & is ACTIVE |
| Ticket → Resource | Member 3 uses Member 1's resource data | Member 3 links tickets to resources |
| Booking → Notification | Member 2 triggers Member 4's notifications | Member 2 calls `NotificationService.create()` on approve/reject |
| Ticket → Notification | Member 3 triggers Member 4's notifications | Member 3 calls `NotificationService.create()` on status change and new comment |
| All → Auth | Everyone uses Member 4's auth | Member 4 must set up security config first so everyone can test their endpoints |

**Critical dependency:** Member 4 should set up the security config and OAuth2 login **first** (Week 1) so other members can test their endpoints with authentication.

---

## 13. Implementation Timeline

### Week 1 (Apr 7–13): Foundation ← We Are Here

| Day | Task | Owner |
|-----|------|-------|
| Mon-Tue | Set up all JPA entities across all modules | ALL |
| Mon-Tue | Set up Spring Security + OAuth2 + JWT | Member 4 |
| Wed-Thu | Set up repositories with custom queries | ALL |
| Wed-Thu | Create the shared API response wrapper + exception handler | Member 4 |
| Fri-Sat | Create `.env.example`, GitHub Actions CI workflow | ALL |
| Sat-Sun | Set up frontend project structure: router, API layer, auth context | ALL |

### Week 2 (Apr 14–20): Core Backend

| Day | Task | Owner |
|-----|------|-------|
| Mon-Tue | Implement all controller + service endpoints | ALL |
| Wed-Thu | Implement business logic: conflict detection, status transitions, ownership rules | Members 2, 3 |
| Wed-Thu | Implement notification triggers in Booking & Ticket services | Members 2, 3, 4 |
| Fri-Sat | File upload handling for resource images + ticket attachments | Members 1, 3 |
| Sat-Sun | Write unit tests + Postman collection | ALL |

### Week 3 (Apr 21–25): Frontend Development

| Day | Task | Owner |
|-----|------|-------|
| Mon-Tue | Build shared components: layout, sidebar, cards, forms, modals | ALL |
| Wed-Thu | Build module-specific pages (resource catalogue, booking form, ticket form) | ALL |
| Thu-Fri | Build admin pages (review panels, user management, analytics) | ALL |
| Fri-Sat | Implement notifications UI + real-time (if doing WebSocket) | Member 4 |
| Sat-Sun | Dark mode, responsive design, polish | ALL |

### Week 4 (Apr 25–27): Integration & Submission

| Day | Task | Owner |
|-----|------|-------|
| Fri | Full integration testing: frontend ↔ backend | ALL |
| Sat | Bug fixes, screenshots, demo video recording | ALL |
| Sun Morning | Write final report PDF | ALL |
| **Sun 11:45 PM** | **⚠️ SUBMISSION DEADLINE** | ALL |

---

## 14. Glossary

| Term | Meaning |
|------|---------|
| **API** | Application Programming Interface — how frontend talks to backend |
| **REST** | A style of building APIs using HTTP methods (GET, POST, PUT, DELETE) |
| **JWT** | JSON Web Token — a signed token that proves who a user is |
| **OAuth2** | A protocol for logging in using a third party (like Google) |
| **CRUD** | Create, Read, Update, Delete — the four basic operations |
| **DTO** | Data Transfer Object — a simplified version of an entity sent to/from the API |
| **Entity** | A Java class that maps to a database table |
| **Repository** | A class that handles database queries |
| **Service** | A class that contains business logic |
| **Controller** | A class that handles incoming HTTP requests |
| **FK** | Foreign Key — a field in one table that references another table |
| **Enum** | A fixed set of possible values (like PENDING, APPROVED, REJECTED) |
| **WebSocket** | A protocol for real-time, two-way communication between browser and server |
| **SLA** | Service Level Agreement — the promised time to handle a request |
| **CI/CD** | Continuous Integration / Continuous Deployment — automated build & test pipelines |
| **Soft Delete** | Instead of removing a record, mark it as deleted (for audit trail) |
| **Pagination** | Breaking large result sets into smaller pages (e.g., 20 items per page) |
| **CORS** | Cross-Origin Resource Sharing — allowing frontend on port 5173 to call backend on port 8080 |

---

<div align="center">

---

📘 **This document should be read by every team member before starting development.**

If you have questions about any section, raise them in the group chat immediately.

**Let's build something outstanding.** 💪

---

**Smart Campus Operations Hub** · Team 4Outliers · SLIIT 2026

</div>
]]>
