<![CDATA[# 🧭 Team Guide — How We Build This, Step by Step

> Read this. Follow this. No confusion.

---

## 👥 The Team (4 Members)

| Member | Modules | Branch |
|--------|---------|--------|
| **Member 1** | Module A — Resources (catalogue, search, CRUD) | `feature/module-a-resources` |
| **Member 2** | Module B — Bookings (requests, conflicts, approval) | `feature/module-b-bookings` |
| **Member 3** | Module C — Tickets (incidents, comments, attachments) | `feature/module-c-tickets` |
| **Member 4** | Module D + E — Notifications + Auth (OAuth, JWT, roles) | `feature/module-d-notifications` |

---

## 📁 Folder Structure — Where Your Code Goes

### Backend (`backend/src/main/java/com/example/smart_campus_operation_hub/`)

```
smart_campus_operation_hub/
│
├── SmartCampusOperationHubApplication.java     ← Already exists, don't touch
│
├── config/                    ← MEMBER 4 creates this
│   ├── SecurityConfig.java         # Spring Security filter chain
│   ├── CorsConfig.java             # Allow frontend to call backend
│   ├── WebSocketConfig.java        # WebSocket setup (optional)
│   └── JwtConfig.java              # JWT secret, expiry settings
│
├── security/                  ← MEMBER 4 creates this
│   ├── JwtTokenProvider.java       # Generate & validate JWT tokens
│   ├── JwtAuthFilter.java          # Filter that checks JWT on every request
│   └── OAuth2SuccessHandler.java   # Handles Google login callback
│
├── exception/                 ← MEMBER 4 creates this (everyone uses it)
│   ├── GlobalExceptionHandler.java      # Catches all errors, returns clean JSON
│   ├── ResourceNotFoundException.java   # 404 errors
│   ├── ConflictException.java           # 409 booking conflicts
│   ├── UnauthorizedException.java       # 401 errors
│   └── BadRequestException.java         # 400 validation errors
│
├── util/                      ← MEMBER 4 creates this (everyone uses it)
│   └── ApiResponse.java            # Wrapper: { success, data, message, timestamp }
│
├── enums/                     ← ALL MEMBERS add their enums here
│   ├── Role.java                   # USER, TECHNICIAN, MANAGER, ADMIN
│   ├── ResourceStatus.java         # ACTIVE, OUT_OF_SERVICE
│   ├── ResourceType.java           # LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
│   ├── BookingStatus.java          # PENDING, APPROVED, REJECTED, CANCELLED
│   ├── TicketStatus.java           # OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
│   ├── TicketPriority.java         # LOW, MEDIUM, HIGH, CRITICAL
│   ├── TicketCategory.java         # EQUIPMENT_MALFUNCTION, FACILITY_DAMAGE, IT_ISSUE, OTHER
│   └── NotificationType.java       # BOOKING_APPROVED, TICKET_ASSIGNED, etc.
│
│   ┌─────────────────────────────────────────────────────────┐
│   │  EACH MODULE FOLLOWS THE SAME PATTERN:                  │
│   │  model/ → dto/ → repository/ → service/ → controller/  │
│   └─────────────────────────────────────────────────────────┘
│
├── model/                     ← Entity classes (maps to DB tables)
│   ├── User.java                   # MEMBER 4
│   ├── Resource.java               # MEMBER 1
│   ├── Booking.java                # MEMBER 2
│   ├── Ticket.java                 # MEMBER 3
│   ├── Comment.java                # MEMBER 3
│   ├── Attachment.java             # MEMBER 3
│   ├── Notification.java           # MEMBER 4
│   └── NotificationPreference.java # MEMBER 4
│
├── dto/                       ← Request/Response objects
│   ├── request/
│   │   ├── ResourceRequest.java         # MEMBER 1
│   │   ├── BookingRequest.java          # MEMBER 2
│   │   ├── TicketRequest.java           # MEMBER 3
│   │   ├── CommentRequest.java          # MEMBER 3
│   │   └── NotificationPrefRequest.java # MEMBER 4
│   └── response/
│       ├── ResourceResponse.java        # MEMBER 1
│       ├── BookingResponse.java         # MEMBER 2
│       ├── TicketResponse.java          # MEMBER 3
│       ├── CommentResponse.java         # MEMBER 3
│       ├── NotificationResponse.java    # MEMBER 4
│       └── UserResponse.java           # MEMBER 4
│
├── repository/                ← Database queries
│   ├── UserRepository.java          # MEMBER 4
│   ├── ResourceRepository.java      # MEMBER 1
│   ├── BookingRepository.java       # MEMBER 2
│   ├── TicketRepository.java        # MEMBER 3
│   ├── CommentRepository.java       # MEMBER 3
│   ├── AttachmentRepository.java    # MEMBER 3
│   └── NotificationRepository.java  # MEMBER 4
│
├── service/                   ← Business logic
│   ├── UserService.java             # MEMBER 4
│   ├── AuthService.java             # MEMBER 4
│   ├── ResourceService.java         # MEMBER 1
│   ├── BookingService.java          # MEMBER 2
│   ├── TicketService.java           # MEMBER 3
│   ├── CommentService.java          # MEMBER 3
│   ├── FileStorageService.java      # MEMBER 3 (shared with Member 1 for resource images)
│   └── NotificationService.java     # MEMBER 4
│
└── controller/                ← API endpoints
    ├── AuthController.java          # MEMBER 4
    ├── UserController.java          # MEMBER 4
    ├── ResourceController.java      # MEMBER 1
    ├── BookingController.java       # MEMBER 2
    ├── TicketController.java        # MEMBER 3
    ├── CommentController.java       # MEMBER 3
    └── NotificationController.java  # MEMBER 4
```

### Frontend (`frontend/src/`)

```
src/
│
├── main.jsx                        ← Already exists, don't touch
├── App.jsx                         ← MEMBER 4 rewrites this (adds Router)
├── index.css                       ← ALL — shared styles
│
├── api/                       ← API call functions
│   ├── axiosConfig.js              # MEMBER 4 — base URL, JWT interceptor
│   ├── authApi.js                  # MEMBER 4 — login, logout, refresh
│   ├── resourceApi.js              # MEMBER 1 — resource CRUD calls
│   ├── bookingApi.js               # MEMBER 2 — booking CRUD calls
│   ├── ticketApi.js                # MEMBER 3 — ticket CRUD calls
│   └── notificationApi.js          # MEMBER 4 — notification calls
│
├── context/                   ← Shared state
│   └── AuthContext.jsx             # MEMBER 4 — logged-in user, JWT token
│
├── components/                ← Reusable UI pieces
│   ├── common/                     # ALL — shared components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx      # MEMBER 4
│   │   ├── RoleGuard.jsx           # MEMBER 4
│   │   └── EmptyState.jsx
│   │
│   ├── resources/                  # MEMBER 1
│   │   ├── ResourceCard.jsx
│   │   ├── ResourceFilter.jsx
│   │   └── ResourceForm.jsx
│   │
│   ├── bookings/                   # MEMBER 2
│   │   ├── BookingCard.jsx
│   │   ├── BookingForm.jsx
│   │   ├── BookingCalendar.jsx
│   │   └── QrCodeDisplay.jsx
│   │
│   ├── tickets/                    # MEMBER 3
│   │   ├── TicketCard.jsx
│   │   ├── TicketForm.jsx
│   │   ├── CommentThread.jsx
│   │   ├── ImageUpload.jsx
│   │   └── SlaTimer.jsx
│   │
│   └── notifications/              # MEMBER 4
│       ├── NotificationBell.jsx
│       └── NotificationDropdown.jsx
│
├── pages/                     ← Full pages (one per route)
│   ├── auth/                       # MEMBER 4
│   │   ├── LoginPage.jsx
│   │   └── OAuthCallback.jsx
│   │
│   ├── dashboard/                  # MEMBER 4
│   │   └── DashboardPage.jsx
│   │
│   ├── resources/                  # MEMBER 1
│   │   ├── ResourceListPage.jsx
│   │   ├── ResourceDetailPage.jsx
│   │   └── ResourceManagePage.jsx
│   │
│   ├── bookings/                   # MEMBER 2
│   │   ├── BookingListPage.jsx
│   │   ├── BookingCreatePage.jsx
│   │   ├── BookingDetailPage.jsx
│   │   └── BookingReviewPage.jsx
│   │
│   ├── tickets/                    # MEMBER 3
│   │   ├── TicketListPage.jsx
│   │   ├── TicketCreatePage.jsx
│   │   ├── TicketDetailPage.jsx
│   │   └── TicketManagePage.jsx
│   │
│   ├── notifications/              # MEMBER 4
│   │   └── NotificationHistoryPage.jsx
│   │
│   └── admin/                      # MEMBER 4 (page shell), ALL (content)
│       ├── UserManagePage.jsx
│       └── AnalyticsDashboard.jsx
│
└── utils/                     ← Helper functions
    ├── dateUtils.js
    ├── formatters.js
    └── constants.js
```

---

## 🔀 Git Workflow — How to Use Branches Without Breaking Each Other's Code

### The Rule

```
NEVER code directly on `main` or `develop`.
ALWAYS work on your own feature branch.
```

### Setup (Do This Once)

Every member runs this:

```bash
# 1. Clone the repo (if you haven't already)
git clone https://github.com/<your-repo>.git
cd smart-campus-operation-hub

# 2. Create the develop branch (ONE person does this, push it)
git checkout -b develop
git push -u origin develop

# 3. Create YOUR feature branch FROM develop
git checkout develop
git checkout -b feature/module-a-resources    # Member 1
# git checkout -b feature/module-b-bookings  # Member 2
# git checkout -b feature/module-c-tickets   # Member 3
# git checkout -b feature/module-d-auth      # Member 4

# 4. Push your branch
git push -u origin feature/module-a-resources
```

### Daily Workflow (Do This Every Day)

```bash
# BEFORE you start coding — pull latest changes
git checkout develop
git pull origin develop
git checkout feature/module-a-resources    # your branch
git merge develop                          # get any updates from others

# ... code your stuff ...

# WHEN you're done for the day — commit and push
git add .
git commit -m "feat(resources): add ResourceService with CRUD operations"
git push
```

### Merging Your Work Into Develop

When your feature is ready (or at least a chunk of it):

```bash
# 1. Make sure your branch is up to date
git checkout develop
git pull origin develop
git checkout feature/module-a-resources
git merge develop      # resolve any conflicts HERE, not on develop

# 2. Push your branch
git push

# 3. Go to GitHub → Create a Pull Request
#    FROM: feature/module-a-resources
#    TO: develop
#    Title: "feat: Module A — Resource catalogue CRUD"
#    Ask one team member to review it

# 4. After review → Merge the PR on GitHub
```

### Commit Message Convention

Use this format so git history is readable:

```
feat(resources): add search and filter endpoint
feat(bookings): implement conflict detection
feat(tickets): add image attachment upload
feat(auth): setup Google OAuth2 login
fix(bookings): fix overlap detection edge case
docs: update README with setup instructions
test(resources): add unit tests for ResourceService
style: format code with prettier
chore: add dependencies to pom.xml
```

### What to Do When You Get a Merge Conflict

```
Don't panic. It just means two people edited the same file.

1. Open the conflicting file
2. You'll see something like:
   <<<<<<< HEAD
   your code
   =======
   their code
   >>>>>>> develop
3. Decide which version to keep (or combine both)
4. Remove the <<<<<<<, =======, >>>>>>> markers
5. Save, then:
   git add .
   git commit -m "merge: resolve conflict in SecurityConfig"
```

---

## 🚦 Order of Work — Who Starts First

This matters. Some modules depend on others.

### PHASE 1: Foundations (First 2–3 days) — Do Together

**Member 4 starts FIRST** because everyone depends on auth and shared utilities.

```
MEMBER 4 (DO THIS FIRST — Day 1):
  ✅ Create ALL the folders (config/, model/, dto/, etc.)
  ✅ Create enums/ — all enum files (Role, BookingStatus, etc.)
  ✅ Create config/CorsConfig.java
  ✅ Create config/SecurityConfig.java (basic — permit all endpoints for now)
  ✅ Create exception/GlobalExceptionHandler.java
  ✅ Create util/ApiResponse.java
  ✅ Create model/User.java entity
  ✅ Create the frontend AuthContext, axiosConfig, ProtectedRoute
  ✅ Push to develop — EVERYONE PULLS THIS

WHY: Without the security config, other members can't even test their endpoints.
     Without the shared utils, everyone will duplicate code.
```

```
ALL MEMBERS (Day 1–2, after Member 4 pushes):
  ✅ Pull develop
  ✅ Create your own model/ entity files
  ✅ Create your own repository/ files
  ✅ Create your own dto/request/ and dto/response/ files
  ✅ Run the app — make sure it starts without errors
  ✅ Push to your feature branch
```

```
ALL MEMBERS (Day 2–3):
  ✅ Create your service/ files with business logic
  ✅ Create your controller/ files with endpoints
  ✅ Test with Postman
  ✅ Push to your feature branch
  ✅ Create PR to develop
```

### PHASE 2: Backend Complete (Next 4–5 days)

```
Everyone works in PARALLEL on their own module.
No blocking — everyone has their own files.

MEMBER 1: ResourceController → ResourceService → ResourceRepository
MEMBER 2: BookingController → BookingService → BookingRepository
MEMBER 3: TicketController → TicketService → CommentService → AttachmentService
MEMBER 4: AuthController → NotificationController → finish OAuth2 + JWT

INTEGRATION POINTS (coordinate these):
  - Member 2: when BookingService approves/rejects → call NotificationService
    → Talk to Member 4 about the method signature
  - Member 3: when TicketService changes status → call NotificationService
    → Talk to Member 4 about the method signature
```

### PHASE 3: Frontend (Next 4–5 days)

```
Everyone works in PARALLEL on their own pages.

MEMBER 4 first:
  ✅ Setup React Router in App.jsx
  ✅ Create LoginPage, AuthContext, ProtectedRoute
  ✅ Create Navbar + Sidebar layout
  ✅ Push — everyone pulls

Then ALL work on their pages simultaneously.
```

### PHASE 4: Integration (Last 2 days)

```
Merge everything to develop.
Fix bugs together.
Take screenshots.
Record demo video.
Write report.
Submit.
```

---

## ⚠️ Rules to Avoid Disaster

### 1. DO NOT edit files that aren't yours

```
Member 1: ONLY touch files in your module (Resource*)
Member 2: ONLY touch files in your module (Booking*)
Member 3: ONLY touch files in your module (Ticket*, Comment*, Attachment*)
Member 4: Touch shared files (config, security, auth, notification, enums)
```

If you need to change a shared file (like pom.xml or App.jsx), **tell the group chat first**.

### 2. DO NOT push to `main` or `develop` directly

Always use Pull Requests. Always.

### 3. Pull `develop` every morning

Before you start coding, ALWAYS:
```bash
git checkout develop && git pull && git checkout your-branch && git merge develop
```

### 4. Keep commits small and frequent

❌ Bad: One giant commit "added everything"
✅ Good: Multiple small commits throughout the day

### 5. Test your endpoint before pushing

Open Postman → hit your endpoint → make sure it returns the right response.
Don't push broken code.

### 6. Communicate

- "I'm about to change pom.xml to add a new dependency" → tell the chat
- "I'm stuck on X" → ask immediately, don't waste hours
- "I merged my PR to develop" → tell everyone so they pull

---

## 🛠️ Quick Reference — Key Commands

```bash
# Start backend
cd backend && ./mvnw spring-boot:run

# Start frontend
cd frontend && npm run dev

# Create a new branch
git checkout -b feature/my-feature

# See what you changed
git status
git diff

# Commit your work
git add .
git commit -m "feat(module): what you did"
git push

# Get latest changes
git checkout develop
git pull origin develop

# Merge develop into your branch
git checkout feature/your-branch
git merge develop

# See all branches
git branch -a

# Switch branches
git checkout feature/module-b-bookings
```

---

## 📋 Day 1 Checklist (Everyone Do This Today)

- [ ] Make sure you can clone the repo and run both backend and frontend
- [ ] Member 4: Create the shared folder structure and push to develop
- [ ] Everyone: Pull develop, create your feature branch
- [ ] Everyone: Create your entity files (model/*.java)
- [ ] Everyone: Run the app — confirm no errors
- [ ] Everyone: Push your branch
- [ ] Create a WhatsApp/Discord group if you haven't already

---

**That's it. Follow this guide and you won't step on each other's toes. Let's go.** 🚀
]]>
