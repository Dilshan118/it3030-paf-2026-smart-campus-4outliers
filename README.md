<div align="center">

```
   ██████  ███╗   ███╗  █████╗  ██████╗  ████████╗
   ██╔═══╝ ████╗ ████║ ██╔══██╗ ██╔══██╗ ╚══██╔══╝
   ██████╗ ██╔████╔██║ ███████║ ██████╔╝    ██║
   ╚═══██║ ██║╚██╔╝██║ ██╔══██║ ██╔══██╗    ██║
   ██████║ ██║ ╚═╝ ██║ ██║  ██║ ██║  ██║    ██║
   ╚═════╝ ╚═╝     ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝    ╚═╝
   C · A · M · P · U · S    O P E R A T I O N S    H U B
```

**_One platform. Five modules. Zero chaos._**

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Build](https://img.shields.io/badge/build-passing-success?style=flat-square)
![Modules](https://img.shields.io/badge/modules-5-blue?style=flat-square)
![Endpoints](https://img.shields.io/badge/endpoints-50+-orange?style=flat-square)
![Coffee](https://img.shields.io/badge/fuelled_by-coffee-brown?style=flat-square)

</div>

---

## > MISSION_BRIEF.TXT

A university's day-to-day operations run on a tangle of spreadsheets, sticky notes, and shouted requests down a corridor. **Smart Campus Operations Hub** replaces all of it with **one pane of glass** for staff, students, and admins.

Book a lab. Raise a ticket for a broken projector. Approve a request. Get notified when it's done. All in one place. Auditable, role-scoped, and production-minded.

Built for `IT3030 — Programming Applications and Frameworks` (SLIIT, Semester 1, 2026) by **Team 4outliers** — four developers, one cohesive system, and a conscious refusal to build yet-another-CRUD-app.

---

## > OPERATIONAL SECTORS

The system is split into five vertically-sliced modules. Each member owns a sector end-to-end — database, API, UI, tests.

<table>
<tr>
<td width="20%" align="center"><b>SECTOR A</b><br/><sub>FACILITIES &<br/>ASSETS</sub></td>
<td>Lecture halls, labs, meeting rooms, equipment. Full CRUD with soft-delete, metadata-rich catalogue, JSON availability windows, multi-image base64 storage, dynamic filter queries, analytics dashboard, and an <b>explainable AI recommender</b> that scores resources by capacity fit, health, maturity, and location match.</td>
</tr>
<tr>
<td align="center"><b>SECTOR B</b><br/><sub>BOOKINGS</sub></td>
<td><code>PENDING → APPROVED / REJECTED → CANCELLED</code>. Conflict detection on overlapping time ranges. Admin review workflow with reasons. User views their own, admin sees all.</td>
</tr>
<tr>
<td align="center"><b>SECTOR C</b><br/><sub>TICKETING</sub></td>
<td><code>OPEN → IN_PROGRESS → RESOLVED → CLOSED</code> (or <code>REJECTED</code>). Up to 3 image attachments per ticket, technician assignment, resolution notes, threaded comments with ownership rules.</td>
</tr>
<tr>
<td align="center"><b>SECTOR D</b><br/><sub>NOTIFICATIONS</sub></td>
<td>Real-time in-app alerts for booking decisions, ticket transitions, and comment activity. Notification panel, unread badges, mark-as-read.</td>
</tr>
<tr>
<td align="center"><b>SECTOR E</b><br/><sub>AUTH &<br/>ACCESS</sub></td>
<td>OAuth 2.0 Google sign-in → JWT session → role-based authorization (<code>USER · ADMIN · MANAGER · TECHNICIAN</code>). Stateless, signed, scoped. Protected both server-side and route-side.</td>
</tr>
</table>

---

## > EQUIPMENT LOADOUT

```
┌─ BACKEND ────────────────────────────────────────────────┐
│  Java 21            ·  Spring Boot 4.0                    │
│  Spring Web         ·  Spring Data JPA (Hibernate)        │
│  Spring Security 6  ·  JJWT 0.12.6                        │
│  Bean Validation    ·  Maven                              │
│  PostgreSQL 16      ·  Flyway-ready schema                │
└───────────────────────────────────────────────────────────┘

┌─ FRONTEND ───────────────────────────────────────────────┐
│  React 19           ·  Vite 8                             │
│  React Router 7     ·  Axios                              │
│  Tailwind CSS 4     ·  Lucide icons                       │
│  Recharts           ·  Swiper (carousels)                 │
│  date-fns           ·  qrcode.react                       │
└───────────────────────────────────────────────────────────┘

┌─ OPS ────────────────────────────────────────────────────┐
│  GitHub + Conventional Commits  ·  GitHub Actions (CI)    │
│  Docker                         ·  Railway  (backend)     │
│  Vercel                         ·  (frontend)             │
└───────────────────────────────────────────────────────────┘
```

---

## > DEPLOYMENT PROTOCOL

> _Zero-to-running in under 5 minutes. Tested on macOS, Linux, and reluctantly on Windows._

### Prerequisites
- **Java 21** (OpenJDK or Temurin)
- **Node 20+** and **npm**
- **PostgreSQL 14+** (or use the Railway connection string from `.env.example`)
- A **Google Cloud OAuth client** (for sign-in)

### 1. Clone the mission

```bash
git clone https://github.com/<your-org>/it3030-paf-2026-smart-campus-4outliers.git
cd it3030-paf-2026-smart-campus-4outliers/smart-campus-operation-hub
```

### 2. Arm the backend

```bash
cd backend
cp .env.example .env     # fill in DB_URL, JWT_SECRET, GOOGLE_CLIENT_ID, ...
./mvnw spring-boot:run   # or: mvn spring-boot:run
# API live on http://localhost:8080
```

### 3. Light up the frontend

```bash
cd ../frontend
cp .env.example .env     # VITE_API_BASE_URL=/api/v1
npm install
npm run dev
# UI live on http://localhost:5173
```

### 4. First-run seed

On first boot the backend auto-seeds a default **admin** account so you're not locked out of your own system. Check `output.log` for the generated credentials or seed script.

---

## > COMMS CHANNELS (API HIGHLIGHTS)

The API lives at `/api/v1`. Every mutating endpoint is role-guarded via `@PreAuthorize`. A representative slice from Sector A:

```http
GET    /api/v1/resources                    → 200  paginated list
GET    /api/v1/resources/{id}               → 200 | 404
GET    /api/v1/resources/search?type=LAB    → 200  dynamic filters
POST   /api/v1/resources                    → 201  ADMIN/MANAGER only
PUT    /api/v1/resources/{id}               → 200  full update
PATCH  /api/v1/resources/{id}/status        → 200  toggle ACTIVE ↔ OOS
DELETE /api/v1/resources/{id}               → 204  soft delete
POST   /api/v1/resources/{id}/image         → 200  multipart upload
GET    /api/v1/resources/analytics          → 200  dashboard stats
POST   /api/v1/resources/recommend          → 200  AI-scored top 6
```

> Full Postman collection lives in [`docs/postman/`](./smart-campus-operation-hub/docs/postman/). Import, set `{{baseUrl}}` and `{{jwt}}`, and fire at will.

---

## > SYSTEM BLUEPRINT

```
         ┌────────────────┐         ┌────────────────┐
         │   React SPA    │ HTTPS   │  Spring Boot   │
         │    (Vercel)    │ ──────▶│   REST API      │──┐
         └────────────────┘         │  (Railway)     │  │
                ▲                   └────────────────┘  │
                │                          ▲            │
                │ OAuth2 redirect          │ JPA        │
                ▼                          ▼            │
         ┌────────────────┐         ┌────────────────┐  │
         │   Google IdP   │         │  PostgreSQL    │◀─┘
         └────────────────┘         └────────────────┘

   CI  ───  GitHub Actions  ───  lint ▸ test ▸ build ▸ deploy
```

Layered backend:

```
  Controller  ──▶  DTO  ──▶  Service  ──▶  Repository  ──▶  Entity
     │                          │                               │
     └─ @Valid                  └─ @Transactional               └─ @Entity
     └─ @PreAuthorize           └─ business logic                  + @PrePersist
     └─ ResponseEntity          └─ DTO ↔ entity map                + soft delete
```

---

## > REPOSITORY MAP

```
it3030-paf-2026-smart-campus-4outliers/
├── smart-campus-operation-hub/
│   ├── backend/
│   │   └── src/main/java/com/example/smart_campus_operation_hub/
│   │       ├── controller/    ← REST entry points
│   │       ├── service/       ← business logic
│   │       ├── repository/    ← Spring Data interfaces
│   │       ├── model/         ← JPA entities
│   │       ├── dto/           ← request/response shapes
│   │       ├── enums/         ← ResourceType, ResourceStatus, ...
│   │       ├── config/        ← SecurityConfig, CORS, OAuth2
│   │       ├── security/      ← JwtAuthFilter, UserDetails
│   │       ├── exception/     ← GlobalExceptionHandler
│   │       ├── scheduler/     ← background jobs
│   │       └── util/          ← helpers
│   ├── frontend/
│   │   └── src/
│   │       ├── pages/         ← route-level screens
│   │       ├── components/    ← reusable UI
│   │       ├── api/           ← Axios clients per module
│   │       ├── context/       ← auth state
│   │       ├── hooks/         ← custom hooks
│   │       └── utils/         ← url resolver, formatters
│   └── docs/
│       ├── SRS.md             ← requirements spec
│       └── postman/           ← API collection
├── .github/workflows/         ← CI pipelines
├── README.md                  ← you are here
└── MODULE_A_VIVA_PREP.md      ← study notes (Sector A)
```

---

## > SAFETY PROTOCOLS

- **Every mutation** gatewayed by role via `@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")`.
- **Every input** validated with Jakarta Bean Validation annotations; failures auto-translate to `400` with field-level errors.
- **Every query** parameterised — zero raw string concatenation, zero SQL injection surface.
- **Every upload** size-capped (5 MB), MIME-checked, and base64-encoded so untrusted bytes are never served as files.
- **Every error** funneled through `GlobalExceptionHandler` into a consistent JSON envelope.

---

## > THE CREW

> _Four developers. Five modules. One system._

| Operative | Sector | Callsign |
|---|---|---|
| **Amasha Weerasuriya** | Sector A — Facilities & Assets | [`@amawee03`](https://github.com/amawee03) |
| **Dilshan Rajapakshe** | Sector B — Bookings | [`@Dilshan118`](https://github.com/Dilshan118) |
| **Vidun Dinsara** | Sector C — Ticketing | [`@Vidun0o`](https://github.com/Vidun0o) |
| **Vinuri Dahanayake** | Sector D & E — Notifications + Auth | [`@vinuridahanayake`](https://github.com/vinuridahanayake) |

Commit attribution is clean — run `git shortlog -sn` for the receipts.

---

## > INTEL DISCLOSURE

Per the course academic-integrity policy, this team used **AI-assisted code completion** (ChatGPT, GitHub Copilot, and Claude) during development — primarily for boilerplate scaffolding, regex patterns, and test-data generation. Every line in this repository was read, understood, and is defensible by the member who authored it. Architecture decisions, module design, business logic, and the AI recommendation algorithm are original work.

---

## > WHAT'S IN THE VAULT (BEYOND THE BRIEF)

The assignment listed the minimums. We shipped extras:

- **Explainable AI resource recommender** with weighted scoring and plain-English reasons
- **Analytics dashboard** with live pie/bar charts of resource distribution
- **Multi-image carousel** per resource with drag-and-drop upload
- **JSON availability windows** with a 7-day visual editor
- **Conventional commits** across the entire history — `git log` reads like a changelog
- **Soft-delete pattern** across mutable entities so audit trails stay intact

---

## > QUICK COMMANDS

```bash
# Backend — run tests
cd backend && ./mvnw test

# Backend — build jar
./mvnw clean package

# Frontend — lint
cd frontend && npm run lint

# Frontend — prod build
npm run build

# Full reset
docker compose down -v && docker compose up --build
```

---

## > LICENSE

Coursework deliverable for `IT3030 — Programming Applications and Frameworks`,
Faculty of Computing, **SLIIT**, Semester 1 · 2026.

Not licensed for reuse, redistribution, or submission by third parties.
Academic integrity is non-negotiable.

---

<div align="center">

**`[ END OF TRANSMISSION ]`**

<sub>_Built with long nights, longer standups, and the firm belief that universities deserve better software._</sub>

<sub>`Team 4outliers · SLIIT · 2026`</sub>

</div>
