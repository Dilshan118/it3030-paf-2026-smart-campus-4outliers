<![CDATA[<div align="center">

# 🏛️ Smart Campus Operations Hub

### _A Production-Grade University Resource & Maintenance Management Platform_

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.4-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-336791?logo=postgresql)](https://neon.tech/)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk)](https://openjdk.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Academic-blue)]()
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions)](https://github.com/features/actions)

---

**IT3030 — Programming Applications & Frameworks | Assignment 2026 (Semester 1)**  
**Faculty of Computing — SLIIT**

> A full-stack web platform enabling universities to manage facility & equipment bookings, handle maintenance/incident tickets, and enforce role-based access — all from a single, unified dashboard.

[Getting Started](#-getting-started) · [Architecture](#-system-architecture) · [Modules](#-core-modules) · [API Docs](#-api-documentation) · [Team](#-team-contribution-matrix)

</div>

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Highlights & Innovation](#-key-highlights--innovation)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Core Modules](#-core-modules)
  - [Module A — Facilities & Assets Catalogue](#module-a--facilities--assets-catalogue)
  - [Module B — Booking Management](#module-b--booking-management)
  - [Module C — Maintenance & Incident Ticketing](#module-c--maintenance--incident-ticketing)
  - [Module D — Notifications](#module-d--notifications)
  - [Module E — Authentication & Authorization](#module-e--authentication--authorization)
- [Innovation Features (Bonus)](#-innovation-features-bonus)
- [Database Design](#-database-design)
- [API Documentation](#-api-documentation)
- [Implementation Plan & Workflow](#-implementation-plan--workflow)
- [Team Contribution Matrix](#-team-contribution-matrix)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Testing Strategy](#-testing-strategy)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Screenshots & Evidence](#-screenshots--evidence)
- [Submission Checklist](#-submission-checklist)

---

## 🎯 Project Overview

A university is modernizing its day-to-day operations. The **Smart Campus Operations Hub** is a single web platform to:

- **Manage facility & asset bookings** — rooms, labs, projectors, cameras, and equipment
- **Handle maintenance & incident workflows** — fault reports, technician assignments, resolution tracking
- **Enforce role-based security** — OAuth 2.0 login with role-differentiated access (USER, ADMIN, TECHNICIAN, MANAGER)
- **Deliver real-time notifications** — booking approvals, ticket status changes, comment alerts

The platform supports a clear workflow, strong auditability, and production-grade quality.

---

## 🌟 Key Highlights & Innovation

What makes this project **stand out** from typical submissions:

| Feature | Description |
|---|---|
| 🔐 **OAuth 2.0 + 4-Tier Roles** | Google Sign-In with USER, ADMIN, TECHNICIAN, MANAGER roles for fine-grained access |
| 📊 **Admin Analytics Dashboard** | Real-time charts showing top resources, peak booking hours, ticket resolution metrics |
| 📱 **QR Code Check-In** | Approved bookings generate QR codes for scan-based verification at the venue |
| ⏱️ **SLA Timer for Tickets** | Tracks time-to-first-response and time-to-resolution with visual countdown indicators |
| 🔔 **Real-Time Notification Panel** | WebSocket-powered live notifications with category-based preferences |
| 🗓️ **Interactive Calendar View** | Drag-and-drop calendar for booking management with conflict visualization |
| 📎 **Smart File Upload** | Drag-and-drop image attachments for tickets with preview, compression & validation |
| 🌙 **Dark/Light Theme** | Full theme support across the entire application |
| 📈 **Audit Trail Logging** | Every action logged with timestamp, user, and change details for full traceability |
| 🧪 **Comprehensive Testing** | Unit + Integration tests with Postman collection for all endpoints |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 21** | Core language |
| **Spring Boot 4.0.4** | REST API framework |
| **Spring Data JPA** | ORM & data persistence |
| **Spring Security** | Authentication & authorization |
| **Spring OAuth2 Client** | Google OAuth 2.0 integration |
| **Spring WebSocket** | Real-time notifications |
| **PostgreSQL (NeonDB)** | Cloud-hosted relational database |
| **Spring Validation** | Input validation (Jakarta Bean Validation) |
| **Spring Mail** | Email notification delivery |
| **Lombok** | Boilerplate reduction |
| **MapStruct** | DTO-Entity mapping |
| **spring-dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19.2** | UI library |
| **Vite 8.0** | Build tool & dev server |
| **React Router v7** | Client-side routing & route protection |
| **Axios** | HTTP client for API communication |
| **React Query (TanStack)** | Server state management & caching |
| **Zustand** | Global client state management |
| **Chart.js / Recharts** | Analytics dashboard charts |
| **React-Toastify** | Toast notifications |
| **Framer Motion** | Animations & transitions |
| **React QR Code** | QR code generation for bookings |
| **Day.js** | Date/time handling |

### DevOps & Quality
| Technology | Purpose |
|---|---|
| **GitHub Actions** | CI/CD pipeline (build + test) |
| **JUnit 5 + Mockito** | Backend unit & integration tests |
| **Postman** | API testing collections |
| **ESLint** | Frontend code quality |
| **Docker** _(optional)_ | Containerized deployment |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              React 19 + Vite 8 (SPA)                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │    │
│  │  │  Pages   │ │Components│ │  Hooks   │ │  Context  │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │        API Service Layer (Axios + React Query)   │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │ HTTP/HTTPS + WebSocket              │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          Spring Security + OAuth2 Filter Chain          │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │    │
│  │  │  CORS    │ │   JWT    │ │  Role    │ │  Rate     │  │    │
│  │  │  Filter  │ │  Filter  │ │  Filter  │ │  Limiter  │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                   APPLICATION LAYER                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Resource │ │ Booking  │ │  Ticket  │ │ Notific. │           │
│  │Controller│ │Controller│ │Controller│ │Controller│           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │             │            │             │                 │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐           │
│  │ Resource │ │ Booking  │ │  Ticket  │ │ Notific. │           │
│  │ Service  │ │ Service  │ │  Service │ │ Service  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │             │            │             │                 │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐           │
│  │ Resource │ │ Booking  │ │  Ticket  │ │ Notific. │           │
│  │   Repo   │ │   Repo   │ │   Repo   │ │   Repo   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                    DATA LAYER                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              PostgreSQL (NeonDB — Cloud)                 │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │    │
│  │  │ users  │ │resource│ │booking │ │ ticket │ │notif. │ │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └───────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Layered Architecture Pattern (Backend)

```
Controller Layer  →  Handles HTTP requests, validation, response mapping
       ↓
Service Layer     →  Business logic, workflow rules, conflict checking
       ↓
Repository Layer  →  Data access via Spring Data JPA
       ↓
Entity Layer      →  JPA entities mapped to PostgreSQL tables
```

---

## 📦 Core Modules

### Module A — Facilities & Assets Catalogue

> **Owner: Member 1** | Backend + Frontend

**Description:** A complete resource catalogue for managing university facilities and equipment.

**Features:**
- CRUD operations for resources (lecture halls, labs, meeting rooms, projectors, cameras, etc.)
- Resource metadata: `type`, `capacity`, `location`, `availability_windows`, `status` (ACTIVE / OUT_OF_SERVICE)
- Search & filter by type, capacity, location, and status
- Image upload for resource photos
- Resource availability calendar view (frontend)
- Bulk import/export support (CSV)

**Backend Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/resources` | List all resources (with pagination & filters) | USER, ADMIN |
| `GET` | `/api/v1/resources/{id}` | Get resource details | USER, ADMIN |
| `POST` | `/api/v1/resources` | Create new resource | ADMIN |
| `PUT` | `/api/v1/resources/{id}` | Update resource | ADMIN |
| `DELETE` | `/api/v1/resources/{id}` | Delete resource (soft delete) | ADMIN |
| `GET` | `/api/v1/resources/search` | Search & filter resources | USER, ADMIN |
| `PATCH` | `/api/v1/resources/{id}/status` | Toggle resource status | ADMIN |

**Frontend Pages:**
- `/resources` — Resource catalogue grid/list with search & filters
- `/resources/:id` — Resource detail page with availability calendar
- `/admin/resources` — Admin management panel (CRUD)

---

### Module B — Booking Management

> **Owner: Member 2** | Backend + Frontend

**Description:** Complete booking workflow with scheduling conflict prevention.

**Features:**
- Create booking requests with: date, time range, purpose, expected attendees
- Booking workflow: `PENDING → APPROVED / REJECTED` (approved bookings can be `CANCELLED`)
- **Scheduling conflict detection** — prevents overlapping time ranges for the same resource
- Admin review panel: approve/reject with reason
- Users see their own bookings; Admin can view/filter all bookings
- **QR code generation** for approved bookings (innovation)
- Interactive calendar view with drag-and-drop (innovation)

**Backend Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/bookings` | List bookings (own for USER, all for ADMIN) | USER, ADMIN |
| `GET` | `/api/v1/bookings/{id}` | Get booking details | USER, ADMIN |
| `POST` | `/api/v1/bookings` | Create new booking request | USER |
| `PUT` | `/api/v1/bookings/{id}` | Update booking (only if PENDING) | USER |
| `DELETE` | `/api/v1/bookings/{id}` | Cancel booking | USER, ADMIN |
| `PATCH` | `/api/v1/bookings/{id}/approve` | Approve booking | ADMIN |
| `PATCH` | `/api/v1/bookings/{id}/reject` | Reject booking (with reason) | ADMIN |
| `GET` | `/api/v1/bookings/{id}/qr` | Generate QR code for booking | USER |
| `GET` | `/api/v1/bookings/conflicts` | Check for scheduling conflicts | USER, ADMIN |

**Booking Workflow State Machine:**

```
    ┌───────────┐
    │  PENDING   │
    └─────┬─────┘
          │ Admin Action
    ┌─────┴─────┐
    ▼           ▼
┌────────┐ ┌────────┐
│APPROVED│ │REJECTED│
└───┬────┘ └────────┘
    │ User/Admin Action
    ▼
┌─────────┐
│CANCELLED│
└─────────┘
```

**Conflict Detection Algorithm:**
```
Given: new_booking(resource_id, start_time, end_time)
Check: ∃ existing_booking WHERE
  resource_id = new_booking.resource_id
  AND status IN ('PENDING', 'APPROVED')
  AND start_time < new_booking.end_time
  AND end_time > new_booking.start_time
→ If found: REJECT with conflict details
→ If not found: ALLOW booking creation
```

**Frontend Pages:**
- `/bookings` — My bookings dashboard
- `/bookings/new` — Create booking form with resource selector + calendar
- `/bookings/:id` — Booking detail with QR code (if approved)
- `/admin/bookings` — Admin review & management panel

---

### Module C — Maintenance & Incident Ticketing

> **Owner: Member 3** | Backend + Frontend

**Description:** Complete incident management lifecycle with image evidence and technician assignment.

**Features:**
- Create tickets with: resource/location, category, description, priority, contact details
- Upload up to **3 image attachments** (evidence of damage/error)
- Ticket workflow: `OPEN → IN_PROGRESS → RESOLVED → CLOSED` (Admin can set `REJECTED` with reason)
- **Technician assignment** — Admin assigns a technician who can update status & add resolution notes
- **Comment system** with ownership rules (edit/delete own comments only)
- **SLA timer** — tracks time-to-first-response and time-to-resolution (innovation)

**Backend Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/tickets` | List tickets (own for USER, all for ADMIN) | ALL |
| `GET` | `/api/v1/tickets/{id}` | Get ticket details with comments | ALL |
| `POST` | `/api/v1/tickets` | Create new incident ticket | USER |
| `PUT` | `/api/v1/tickets/{id}` | Update ticket details | USER (own), ADMIN |
| `PATCH` | `/api/v1/tickets/{id}/status` | Update ticket status | TECHNICIAN, ADMIN |
| `PATCH` | `/api/v1/tickets/{id}/assign` | Assign technician | ADMIN |
| `POST` | `/api/v1/tickets/{id}/comments` | Add comment | ALL |
| `PUT` | `/api/v1/tickets/{id}/comments/{commentId}` | Edit own comment | OWNER |
| `DELETE` | `/api/v1/tickets/{id}/comments/{commentId}` | Delete own comment | OWNER, ADMIN |
| `POST` | `/api/v1/tickets/{id}/attachments` | Upload image attachments (max 3) | USER |
| `DELETE` | `/api/v1/tickets/{id}/attachments/{attachmentId}` | Remove attachment | USER, ADMIN |

**Ticket Workflow State Machine:**

```
    ┌──────┐
    │ OPEN │ ← Ticket Created
    └──┬───┘
       │ Technician Assigned
       ▼
  ┌────────────┐      ┌──────────┐
  │IN_PROGRESS │      │ REJECTED │ ← Admin Action (with reason)
  └─────┬──────┘      └──────────┘
        │ Technician Resolves
        ▼
   ┌──────────┐
   │ RESOLVED │
   └────┬─────┘
        │ Admin Verifies & Closes
        ▼
   ┌────────┐
   │ CLOSED │
   └────────┘
```

**Frontend Pages:**
- `/tickets` — My tickets / All tickets dashboard
- `/tickets/new` — Create ticket form with image upload
- `/tickets/:id` — Ticket detail view with comments timeline & SLA timer
- `/admin/tickets` — Admin assignment & management panel

---

### Module D — Notifications

> **Owner: Member 4** | Backend + Frontend

**Description:** Real-time notification system for all platform events.

**Features:**
- Notifications triggered by:
  - ✅ Booking approval / rejection
  - 🔄 Ticket status changes
  - 💬 New comments on tickets
  - 👤 Technician assignment
- **Real-time delivery** via WebSocket (innovation)
- In-app notification panel with read/unread status
- **Notification preferences** — users can enable/disable categories (innovation)
- Email notifications for critical events (booking approval, ticket escalation)
- Notification history with pagination

**Backend Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/notifications` | List user notifications (paginated) | USER |
| `GET` | `/api/v1/notifications/unread-count` | Get unread notification count | USER |
| `PATCH` | `/api/v1/notifications/{id}/read` | Mark notification as read | USER |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all as read | USER |
| `DELETE` | `/api/v1/notifications/{id}` | Delete notification | USER |
| `GET` | `/api/v1/notifications/preferences` | Get notification preferences | USER |
| `PUT` | `/api/v1/notifications/preferences` | Update notification preferences | USER |
| `WS` | `/ws/notifications` | WebSocket endpoint for live updates | USER |

**Frontend Components:**
- Notification bell icon with unread badge (global header)
- Dropdown notification panel
- `/notifications` — Full notification history page
- `/settings/notifications` — Notification preferences page

---

### Module E — Authentication & Authorization

> **Owner: Member 4** | Backend + Frontend

**Description:** OAuth 2.0 authentication with 4-tier role-based access control.

**Features:**
- **Google OAuth 2.0 Sign-In** (primary authentication)
- Role hierarchy: `USER → TECHNICIAN → MANAGER → ADMIN`
- JWT token-based session management
- Role-based endpoint protection (Spring Security)
- Route guards on frontend (React Router)
- User profile management
- Admin user management panel (role assignment)

**Roles & Permissions Matrix:**

| Action | USER | TECHNICIAN | MANAGER | ADMIN |
|--------|------|------------|---------|-------|
| View resources | ✅ | ✅ | ✅ | ✅ |
| Create/edit resources | ❌ | ❌ | ✅ | ✅ |
| Create bookings | ✅ | ✅ | ✅ | ✅ |
| Approve/reject bookings | ❌ | ❌ | ✅ | ✅ |
| Create tickets | ✅ | ✅ | ✅ | ✅ |
| Update ticket status | ❌ | ✅ (assigned) | ✅ | ✅ |
| Assign technicians | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| View analytics dashboard | ❌ | ❌ | ✅ | ✅ |

**Backend Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/auth/login` | Initiate Google OAuth2 flow | PUBLIC |
| `GET` | `/api/v1/auth/callback` | OAuth2 callback handler | PUBLIC |
| `POST` | `/api/v1/auth/refresh` | Refresh JWT token | USER |
| `POST` | `/api/v1/auth/logout` | Invalidate session | USER |
| `GET` | `/api/v1/users/me` | Get current user profile | USER |
| `PUT` | `/api/v1/users/me` | Update profile | USER |
| `GET` | `/api/v1/admin/users` | List all users | ADMIN |
| `PATCH` | `/api/v1/admin/users/{id}/role` | Update user role | ADMIN |

---

## 🚀 Innovation Features (Bonus)

These features elevate the project beyond minimum requirements:

### 1. 📊 Admin Analytics Dashboard
- **Top booked resources** — bar chart with usage frequency
- **Peak booking hours** — heatmap visualization by day & hour
- **Ticket resolution metrics** — avg time-to-close, backlog trends
- **User activity stats** — most active users, recent sign-ups
- **Resource utilization rate** — percentage of time each resource is booked vs available

### 2. 📱 QR Code Check-In
- Approved bookings generate a unique QR code
- Check-in screen (simple verification page) scans the QR and validates the booking
- Logs actual check-in time for audit purposes

### 3. ⏱️ SLA Timer for Tickets
- Configurable SLA targets (e.g., first response within 4h, resolution within 24h)
- Visual countdown timer on ticket detail page
- Color-coded urgency indicators (green → yellow → red)
- SLA breach alerts sent as notifications

### 4. 🔔 Notification Preferences
- Users can toggle notification categories (bookings, tickets, comments)
- Choice of delivery channel (in-app, email, both)
- Quiet hours configuration

### 5. 🌙 Dark/Light Theme Toggle
- System-wide theme support
- Persisted preference via localStorage
- Smooth CSS transition between themes

---

## 🗄️ Database Design

### Entity-Relationship Overview

```
┌───────────┐     ┌───────────────┐     ┌──────────────┐
│   users   │     │   resources   │     │   bookings   │
├───────────┤     ├───────────────┤     ├──────────────┤
│ id (PK)   │     │ id (PK)       │     │ id (PK)      │
│ email     │     │ name          │     │ user_id (FK) │───→ users
│ name      │     │ type          │     │ resource_id  │───→ resources
│ avatar    │     │ capacity      │     │ date         │
│ role      │     │ location      │     │ start_time   │
│ provider  │     │ status        │     │ end_time     │
│ provider_ │     │ availability_ │     │ purpose      │
│   id      │     │   windows     │     │ attendees    │
│ created_at│     │ description   │     │ status       │
│ updated_at│     │ image_url     │     │ admin_reason │
└───────────┘     │ created_at    │     │ qr_code      │
      │           │ updated_at    │     │ checked_in_at│
      │           └───────────────┘     │ created_at   │
      │                                 │ updated_at   │
      │                                 └──────────────┘
      │
      │           ┌───────────────┐     ┌──────────────┐
      │           │    tickets    │     │   comments   │
      │           ├───────────────┤     ├──────────────┤
      └──────────→│ id (PK)       │     │ id (PK)      │
                  │ user_id (FK)  │     │ ticket_id(FK)│───→ tickets
                  │ resource_id   │───→ │ author_id(FK)│───→ users
                  │ category      │     │ content      │
                  │ description   │     │ created_at   │
                  │ priority      │     │ updated_at   │
                  │ status        │     └──────────────┘
                  │ assigned_to   │───→ users (technician)
                  │ contact_info  │     ┌──────────────┐
                  │ resolution_   │     │ attachments  │
                  │   notes       │     ├──────────────┤
                  │ sla_deadline  │     │ id (PK)      │
                  │ first_response│     │ ticket_id(FK)│───→ tickets
                  │   _at         │     │ file_url     │
                  │ resolved_at   │     │ file_name    │
                  │ created_at    │     │ file_size    │
                  │ updated_at    │     │ created_at   │
                  └───────────────┘     └──────────────┘

┌────────────────┐     ┌─────────────────────┐
│ notifications  │     │ notification_prefs  │
├────────────────┤     ├─────────────────────┤
│ id (PK)        │     │ id (PK)             │
│ user_id (FK)   │───→ │ user_id (FK)        │───→ users
│ type           │     │ booking_enabled     │
│ title          │     │ ticket_enabled      │
│ message        │     │ comment_enabled     │
│ reference_id   │     │ email_enabled       │
│ reference_type │     │ quiet_hours_start   │
│ is_read        │     │ quiet_hours_end     │
│ created_at     │     └─────────────────────┘
└────────────────┘

┌────────────────┐
│  audit_logs    │
├────────────────┤
│ id (PK)        │
│ user_id (FK)   │───→ users
│ action         │
│ entity_type    │
│ entity_id      │
│ old_value      │
│ new_value      │
│ ip_address     │
│ created_at     │
└────────────────┘
```

### Key Database Design Decisions

- **Soft deletes** for resources and bookings (maintain audit trail)
- **Indexing** on frequently queried columns: `status`, `user_id`, `resource_id`, `created_at`
- **JSONB** for flexible fields like `availability_windows` and `contact_info`
- **Enum types** for status fields with database-level constraints
- **Timestamps** auto-managed by JPA `@PrePersist` / `@PreUpdate`

---

## 📘 API Documentation

### API Conventions

```
Base URL:  http://localhost:8080/api/v1

Headers:
  Content-Type: application/json
  Authorization: Bearer <jwt_token>

Response Format:
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-04-10T10:00:00Z"
}

Error Format:
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource with ID 42 not found",
    "details": { ... }
  },
  "timestamp": "2026-04-10T10:00:00Z"
}

Pagination:
  ?page=0&size=20&sort=createdAt,desc

HTTP Status Codes:
  200 — OK
  201 — Created
  204 — No Content (DELETE)
  400 — Bad Request (validation errors)
  401 — Unauthorized
  403 — Forbidden (insufficient role)
  404 — Not Found
  409 — Conflict (scheduling conflict)
  500 — Internal Server Error
```

### Complete Endpoint Summary

| Module | Method | Endpoint | Min. Role |
|--------|--------|----------|-----------|
| **Auth** | GET | `/auth/login` | PUBLIC |
| | GET | `/auth/callback` | PUBLIC |
| | POST | `/auth/refresh` | USER |
| | POST | `/auth/logout` | USER |
| **Users** | GET | `/users/me` | USER |
| | PUT | `/users/me` | USER |
| | GET | `/admin/users` | ADMIN |
| | PATCH | `/admin/users/{id}/role` | ADMIN |
| **Resources** | GET | `/resources` | USER |
| | GET | `/resources/{id}` | USER |
| | POST | `/resources` | ADMIN |
| | PUT | `/resources/{id}` | ADMIN |
| | DELETE | `/resources/{id}` | ADMIN |
| | GET | `/resources/search` | USER |
| | PATCH | `/resources/{id}/status` | ADMIN |
| **Bookings** | GET | `/bookings` | USER |
| | GET | `/bookings/{id}` | USER |
| | POST | `/bookings` | USER |
| | PUT | `/bookings/{id}` | USER |
| | DELETE | `/bookings/{id}` | USER |
| | PATCH | `/bookings/{id}/approve` | ADMIN |
| | PATCH | `/bookings/{id}/reject` | ADMIN |
| | GET | `/bookings/{id}/qr` | USER |
| | GET | `/bookings/conflicts` | USER |
| **Tickets** | GET | `/tickets` | USER |
| | GET | `/tickets/{id}` | USER |
| | POST | `/tickets` | USER |
| | PUT | `/tickets/{id}` | USER |
| | PATCH | `/tickets/{id}/status` | TECH |
| | PATCH | `/tickets/{id}/assign` | ADMIN |
| | POST | `/tickets/{id}/comments` | USER |
| | PUT | `/tickets/{id}/comments/{cid}` | OWNER |
| | DELETE | `/tickets/{id}/comments/{cid}` | OWNER |
| | POST | `/tickets/{id}/attachments` | USER |
| | DELETE | `/tickets/{id}/attachments/{aid}` | USER |
| **Notifications** | GET | `/notifications` | USER |
| | GET | `/notifications/unread-count` | USER |
| | PATCH | `/notifications/{id}/read` | USER |
| | PATCH | `/notifications/read-all` | USER |
| | DELETE | `/notifications/{id}` | USER |
| | GET | `/notifications/preferences` | USER |
| | PUT | `/notifications/preferences` | USER |
| **Analytics** | GET | `/analytics/bookings` | ADMIN |
| | GET | `/analytics/tickets` | ADMIN |
| | GET | `/analytics/resources` | ADMIN |

> **Total: 38+ unique endpoints across 6 modules**  
> **Each member implements ≥ 4 endpoints with GET, POST, PUT/PATCH, DELETE**

---

## 📋 Implementation Plan & Workflow

### Phase 1: Foundation & Setup (Week 1) — _Apr 7–13_
> **Status: ✅ In Progress**

| Task | Owner | Status |
|------|-------|--------|
| Initialize Spring Boot project | All | ✅ Done |
| Initialize React + Vite project | All | ✅ Done |
| Configure PostgreSQL (NeonDB) connection | All | ✅ Done |
| Setup `.gitignore` & `.gitattributes` | All | ✅ Done |
| Setup project structure (packages, folders) | All | 🔲 Todo |
| Configure Spring Security + OAuth2 | Member 4 | 🔲 Todo |
| Setup GitHub Actions CI pipeline | All | 🔲 Todo |
| Design complete database schema | All | 🔲 Todo |
| Create JPA entities for all modules | All | 🔲 Todo |

### Phase 2: Core Backend Development (Week 2) — _Apr 14–20_

| Task | Owner | Status |
|------|-------|--------|
| **Module A:** Resource entity, repository, service, controller | Member 1 | 🔲 |
| **Module A:** Search & filter endpoints | Member 1 | 🔲 |
| **Module A:** Resource validation & error handling | Member 1 | 🔲 |
| **Module B:** Booking entity, repository, service, controller | Member 2 | 🔲 |
| **Module B:** Conflict detection algorithm | Member 2 | 🔲 |
| **Module B:** Booking approval/rejection workflow | Member 2 | 🔲 |
| **Module C:** Ticket entity, repository, service, controller | Member 3 | 🔲 |
| **Module C:** Comment system with ownership rules | Member 3 | 🔲 |
| **Module C:** Image attachment upload (multipart) | Member 3 | 🔲 |
| **Module D:** Notification entity, repository, service | Member 4 | 🔲 |
| **Module E:** OAuth2 config, JWT generation, role filtering | Member 4 | 🔲 |
| **Module E:** User management endpoints | Member 4 | 🔲 |
| Global exception handler & API response wrapper | Member 4 | 🔲 |
| Backend unit tests (JUnit + Mockito) | All | 🔲 |

### Phase 3: Frontend Development (Week 3) — _Apr 21–25_

| Task | Owner | Status |
|------|-------|--------|
| Design system: theme, colors, typography, components | All | 🔲 |
| Setup React Router with protected routes | Member 4 | 🔲 |
| Google OAuth login page | Member 4 | 🔲 |
| **Module A:** Resource catalogue page (grid/list/filters) | Member 1 | 🔲 |
| **Module A:** Resource detail & admin management pages | Member 1 | 🔲 |
| **Module B:** Booking creation form with calendar | Member 2 | 🔲 |
| **Module B:** My bookings dashboard & admin review panel | Member 2 | 🔲 |
| **Module B:** QR code generation & check-in screen | Member 2 | 🔲 |
| **Module C:** Ticket creation form with drag-drop upload | Member 3 | 🔲 |
| **Module C:** Ticket detail view with comments & SLA timer | Member 3 | 🔲 |
| **Module D:** Notification panel & preferences | Member 4 | 🔲 |
| **Module D:** WebSocket integration for live notifications | Member 4 | 🔲 |
| Admin analytics dashboard with charts | Member 4 | 🔲 |
| Responsive design & dark/light theme | All | 🔲 |

### Phase 4: Integration, Testing & Polish (Week 4) — _Apr 25–27_

| Task | Owner | Status |
|------|-------|--------|
| Full integration testing (frontend ↔ backend) | All | 🔲 |
| Postman collection for all endpoints | All | 🔲 |
| Cross-browser testing | All | 🔲 |
| Performance optimization & loading states | All | 🔲 |
| Error boundary & fallback UI | All | 🔲 |
| Screenshots & video recording | All | 🔲 |
| Final report (PDF) | All | 🔲 |
| Code cleanup & documentation | All | 🔲 |

### Git Workflow

```
main (production-ready)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/module-a-resources     ← Member 1
  │     ├── feature/module-b-bookings      ← Member 2
  │     ├── feature/module-c-tickets       ← Member 3
  │     ├── feature/module-d-notifications ← Member 4
  │     └── feature/module-e-auth          ← Member 4
  │
  └── hotfix/* (critical bug fixes)
```

**Branch Rules:**
1. Each member works on their own `feature/*` branch
2. Create Pull Requests to `develop` — require at least 1 review
3. `develop` → `main` merge only when stable
4. Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`

---

## 👥 Team Contribution Matrix

| Member | Module(s) | Backend Endpoints | Frontend Pages | Innovation |
|--------|-----------|-------------------|----------------|------------|
| **Member 1** | A — Facilities & Assets Catalogue | 7 endpoints (GET, POST, PUT, DELETE, PATCH, Search) | Resource catalogue, detail, admin pages | Resource calendar, CSV import |
| **Member 2** | B — Booking Management | 9 endpoints (GET, POST, PUT, DELETE, PATCH ×2, QR, Conflict) | Booking dashboard, creation, admin review | QR check-in, interactive calendar |
| **Member 3** | C — Maintenance & Incident Ticketing | 11 endpoints (GET, POST, PUT, PATCH ×2, DELETE, Comments CRUD, Attachments) | Ticket dashboard, creation, detail view | SLA timer, drag-drop upload |
| **Member 4** | D — Notifications + E — Auth & Authorization | 11 endpoints (Auth, Users, Notifications, Preferences, WebSocket) | Login, notifications, user mgmt, analytics | Real-time WS, analytics dashboard |

> ⚠️ Each member implements **at least 4 REST API endpoints** using different HTTP methods (GET, POST, PUT/PATCH, DELETE) as required.

---

## 🚀 Getting Started

### Prerequisites

- **Java 21** (JDK) — [Download](https://adoptium.net/)
- **Node.js 20+** & **npm 10+** — [Download](https://nodejs.org/)
- **PostgreSQL** (or use NeonDB cloud) — [NeonDB](https://neon.tech/)
- **Git** — [Download](https://git-scm.com/)
- **Google Cloud Console** project with OAuth 2.0 credentials

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/it3030-paf-2026-smart-campus-groupXX.git
cd it3030-paf-2026-smart-campus-groupXX
```

### 2. Backend Setup

```bash
cd backend

# Create .env file (DO NOT commit this to Git)
cp .env.example .env

# Edit .env with your database credentials
# DB_URL=jdbc:postgresql://<host>/<database>?sslmode=require
# DB_USERNAME=<username>
# DB_PASSWORD=<password>
# GOOGLE_CLIENT_ID=<your-google-client-id>
# GOOGLE_CLIENT_SECRET=<your-google-client-secret>
# JWT_SECRET=<your-jwt-secret>

# Build & Run
./mvnw clean install
./mvnw spring-boot:run
```

Backend will start at: `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
# VITE_API_BASE_URL=http://localhost:8080/api/v1
# VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
# VITE_WS_URL=ws://localhost:8080/ws

# Start development server
npm run dev
```

Frontend will start at: `http://localhost:5173`

### 4. Environment Variables Reference

**Backend (`.env`)**
```env
# Database
DB_URL=jdbc:postgresql://host/database?sslmode=require
DB_USERNAME=your_username
DB_PASSWORD=your_password

# OAuth2
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# JWT
JWT_SECRET=your_256_bit_secret_key
JWT_EXPIRATION=86400000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5MB

# Notifications
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
```

**Frontend (`.env`)**
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_WS_URL=ws://localhost:8080/ws
```

---

## 📁 Project Structure

```
smart-campus-operation-hub/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/smart_campus_operation_hub/
│   │   │   │   ├── SmartCampusOperationHubApplication.java
│   │   │   │   │
│   │   │   │   ├── config/               # Security, CORS, WebSocket, OAuth2 config
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   ├── CorsConfig.java
│   │   │   │   │   ├── WebSocketConfig.java
│   │   │   │   │   └── OAuth2Config.java
│   │   │   │   │
│   │   │   │   ├── controller/           # REST API controllers
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   ├── ResourceController.java
│   │   │   │   │   ├── BookingController.java
│   │   │   │   │   ├── TicketController.java
│   │   │   │   │   ├── CommentController.java
│   │   │   │   │   ├── NotificationController.java
│   │   │   │   │   └── AnalyticsController.java
│   │   │   │   │
│   │   │   │   ├── service/              # Business logic layer
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── UserService.java
│   │   │   │   │   ├── ResourceService.java
│   │   │   │   │   ├── BookingService.java
│   │   │   │   │   ├── TicketService.java
│   │   │   │   │   ├── CommentService.java
│   │   │   │   │   ├── NotificationService.java
│   │   │   │   │   ├── FileStorageService.java
│   │   │   │   │   └── AnalyticsService.java
│   │   │   │   │
│   │   │   │   ├── repository/           # Data access layer
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── ResourceRepository.java
│   │   │   │   │   ├── BookingRepository.java
│   │   │   │   │   ├── TicketRepository.java
│   │   │   │   │   ├── CommentRepository.java
│   │   │   │   │   ├── AttachmentRepository.java
│   │   │   │   │   └── NotificationRepository.java
│   │   │   │   │
│   │   │   │   ├── model/                # JPA entities
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Resource.java
│   │   │   │   │   ├── Booking.java
│   │   │   │   │   ├── Ticket.java
│   │   │   │   │   ├── Comment.java
│   │   │   │   │   ├── Attachment.java
│   │   │   │   │   ├── Notification.java
│   │   │   │   │   ├── NotificationPreference.java
│   │   │   │   │   └── AuditLog.java
│   │   │   │   │
│   │   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   │   │   ├── request/
│   │   │   │   │   └── response/
│   │   │   │   │
│   │   │   │   ├── enums/                # Enumerations
│   │   │   │   │   ├── Role.java
│   │   │   │   │   ├── ResourceStatus.java
│   │   │   │   │   ├── BookingStatus.java
│   │   │   │   │   ├── TicketStatus.java
│   │   │   │   │   ├── TicketPriority.java
│   │   │   │   │   └── NotificationType.java
│   │   │   │   │
│   │   │   │   ├── exception/            # Custom exceptions & global handler
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── ConflictException.java
│   │   │   │   │   └── UnauthorizedException.java
│   │   │   │   │
│   │   │   │   ├── security/             # JWT & OAuth2 utilities
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── JwtAuthFilter.java
│   │   │   │   │   └── OAuth2SuccessHandler.java
│   │   │   │   │
│   │   │   │   └── util/                 # Helper utilities
│   │   │   │       ├── ApiResponse.java
│   │   │   │       └── QrCodeGenerator.java
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── static/
│   │   │       └── templates/
│   │   │
│   │   └── test/                         # Test files
│   │       └── java/com/example/smart_campus_operation_hub/
│   │           ├── controller/
│   │           ├── service/
│   │           └── repository/
│   │
│   ├── .env                              # Environment variables (not committed)
│   ├── .env.example                      # Template for .env
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                      # App entry point
│   │   ├── App.jsx                       # Root component with router
│   │   │
│   │   ├── api/                          # API service layer
│   │   │   ├── axiosConfig.js
│   │   │   ├── authApi.js
│   │   │   ├── resourceApi.js
│   │   │   ├── bookingApi.js
│   │   │   ├── ticketApi.js
│   │   │   └── notificationApi.js
│   │   │
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── common/                   # Buttons, inputs, cards, modals
│   │   │   ├── layout/                   # Header, sidebar, footer
│   │   │   ├── resources/                # Resource-specific components
│   │   │   ├── bookings/                 # Booking-specific components
│   │   │   ├── tickets/                  # Ticket-specific components
│   │   │   └── notifications/            # Notification components
│   │   │
│   │   ├── pages/                        # Page-level components
│   │   │   ├── auth/                     # Login, callback
│   │   │   ├── dashboard/                # Dashboard & analytics
│   │   │   ├── resources/                # Resource pages
│   │   │   ├── bookings/                 # Booking pages
│   │   │   ├── tickets/                  # Ticket pages
│   │   │   ├── notifications/            # Notification pages
│   │   │   └── admin/                    # Admin-only pages
│   │   │
│   │   ├── hooks/                        # Custom React hooks
│   │   ├── store/                        # Zustand state stores
│   │   ├── utils/                        # Helper functions
│   │   ├── styles/                       # Global CSS & theme
│   │   └── assets/                       # Static assets
│   │
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI pipeline
│
├── docs/
│   ├── architecture-diagram.png
│   ├── er-diagram.png
│   ├── screenshots/
│   └── postman/
│       └── SmartCampus.postman_collection.json
│
├── .gitignore
├── .gitattributes
└── README.md                             # ← You are here
```

---

## 🧪 Testing Strategy

### Backend Testing

```bash
cd backend
./mvnw test
```

| Type | Framework | Coverage |
|------|-----------|----------|
| **Unit Tests** | JUnit 5 + Mockito | Service layer logic, conflict detection, validation |
| **Integration Tests** | Spring Boot Test | Controller endpoints, database interactions |
| **API Tests** | Postman Collection | All 38+ endpoints with assertions |

### Test Coverage Targets
- Service layer: **≥ 80%** line coverage
- Controller layer: **≥ 70%** with MockMvc
- Repository layer: **Custom queries only**

### Frontend Testing

```bash
cd frontend
npm run lint     # ESLint code quality
npm run build    # Production build validation
```

### Postman Collection

Import the Postman collection from `docs/postman/SmartCampus.postman_collection.json` for a complete API testing suite with:
- Pre-request scripts for authentication
- Environment variables for easy switching
- Test assertions for response validation
- Collection runner for automated testing

---

## ⚙️ CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
name: Smart Campus CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Build & Test Backend
        working-directory: ./backend
        run: ./mvnw clean verify
        env:
          DB_URL: ${{ secrets.DB_URL }}
          DB_USERNAME: ${{ secrets.DB_USERNAME }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Dependencies
        working-directory: ./frontend
        run: npm ci
      - name: Lint
        working-directory: ./frontend
        run: npm run lint
      - name: Build
        working-directory: ./frontend
        run: npm run build
```

### Pipeline Triggers
- **Push to `main`/`develop`** → Full build + test
- **Pull Request** → Build + test + lint (must pass before merge)
- **Badge** on README shows current build status

---

## 📸 Screenshots & Evidence

> _Add screenshots here during Phase 4_

| Screen | Description |
|--------|-------------|
| Login Page | Google OAuth 2.0 sign-in |
| Dashboard | Admin analytics overview |
| Resource Catalogue | Grid view with search & filters |
| Booking Calendar | Interactive calendar with conflict view |
| Ticket Detail | Timeline view with comments & SLA timer |
| Notification Panel | Real-time notification dropdown |
| QR Check-In | QR code scan verification |
| Dark Mode | Full application in dark theme |

---

## ✅ Submission Checklist

- [ ] GitHub repository is public/accessible to evaluators
- [ ] README.md contains clear setup steps ← ✅ (this file)
- [ ] All 5 modules (A–E) are fully implemented
- [ ] Each member has ≥ 4 REST endpoints (GET, POST, PUT/PATCH, DELETE)
- [ ] Database is persistent (PostgreSQL, not in-memory)
- [ ] OAuth 2.0 login working (Google Sign-In)
- [ ] Role-based access control enforced (backend + frontend)
- [ ] Booking conflict detection working
- [ ] Ticket workflow (OPEN → IN_PROGRESS → RESOLVED → CLOSED) working
- [ ] Image attachments working for tickets (up to 3)
- [ ] Notifications working for bookings & tickets
- [ ] Input validation & meaningful error responses
- [ ] Unit/integration tests present
- [ ] Postman collection included
- [ ] GitHub Actions CI pipeline green ✅
- [ ] Consistent API naming & HTTP status codes
- [ ] No compiled files (node_modules, target) in submission
- [ ] Final report PDF: `IT3030_PAF_Assignment_2026_GroupXX.pdf`
- [ ] Evidence: Screenshots + demo video link
- [ ] Innovation features implemented (QR, SLA, Analytics, etc.)

---

## 📅 Key Dates

| Event | Date |
|-------|------|
| Assignment Released | 24 March 2026 |
| **Viva / Demonstration** | **Starting 11 April 2026** |
| **Submission Deadline** | **27 April 2026, 11:45 PM (GMT+5:30)** |
| Submission Method | Courseweb |

---

<div align="center">

### 🏛️ Smart Campus Operations Hub

Built with ❤️ by **Team 4Outliers** — SLIIT Faculty of Computing

_IT3030 — Programming Applications & Frameworks — 2026_

</div>
]]>
