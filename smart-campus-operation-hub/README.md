# Smart Campus Operation Hub

A full-stack web platform built to help manage the day-to-day operations of a university campus — covering resource bookings, maintenance tickets, user management, and analytics. Built as a final-year project at SLIIT.

---

## What This Is

Campus operations are messy. Rooms get double-booked. Projectors break and no one knows who to tell. Students don't know which study rooms are free. Staff have no clean way to track what needs fixing and who is working on it.

This platform tries to solve those problems in one place:

- Students and staff can **book rooms and resources** with a calendar view and QR check-in
- Anyone can **report issues** (broken equipment, safety concerns, cleaning requests) and track them through to resolution
- Managers can **see the full picture** — who reported what, who is fixing it, whether SLA deadlines are being met
- Admins can **manage users**, approve new accounts, and assign roles
- Everyone gets **notifications** when something changes that concerns them

---

## Features

### Ticket System
Report and track campus issues with a full lifecycle — from "just submitted" to "closed and done."
- Automatic SLA deadlines based on priority (Critical = 4h, High = 24h, Medium = 48h, Low = 72h)
- Smart category and priority suggestions based on what you type
- Technician assignment with automatic status transitions
- Comment threads, file attachments, and resolution notes
- Live SLA countdown timers with breach alerts

### Resource Booking
Book classrooms, labs, and equipment without the back-and-forth emails.
- Calendar view showing availability
- QR code generation for check-in
- Admin approval flow for certain resource types
- Booking history and review system

### Campus Resource Management
A central inventory of every bookable space and piece of equipment on campus.
- Resource details with images
- Category-based filtering and search
- Availability tracking
- Smart Finder feature to suggest resources based on your needs

### Analytics Dashboard
Numbers that are actually useful — not just raw data.
- Ticket volume by category and priority
- SLA compliance rates
- Booking utilization over time
- Exportable reports

### Notifications
Stay informed without having to check manually.
- In-app notification bell with dropdown
- Notifications on ticket status changes, booking confirmations, comment replies
- Notification preferences — turn off what you don't need

### User Management
A proper onboarding and access control flow.
- Login with Google (no passwords to manage)
- New accounts start in a pending state — admin approves them
- Role-based access: Admin, Manager, Technician, User
- Complete profile setup after first login

---

## Tech Stack

### Frontend
| Tool | Version | Why |
|------|---------|-----|
| React | 19 | Component-based UI |
| Vite | 8 | Fast build tool and dev server |
| React Router | 7 | Client-side routing |
| Tailwind CSS | 4 | Utility-first styling |
| Recharts | 3 | Charts for analytics |
| Axios | 1.15 | HTTP requests to the backend |
| Lucide React | — | Icon set |
| QRCode.react | — | QR code generation |
| date-fns | 4 | Date formatting and calculations |
| Swiper | 11 | Carousel/slider components |

### Backend
| Tool | Version | Why |
|------|---------|-----|
| Java | 21 | LTS release with virtual threads |
| Spring Boot | 4 | Full-featured web framework |
| Spring Security | — | Authentication and authorization |
| Spring Data JPA | — | Database ORM layer |
| PostgreSQL | — | Primary production database |
| JJWT | 0.12 | JWT token signing and validation |
| Spring OAuth2 Client | — | Google login integration |
| Maven | 3.9 | Build and dependency management |

### Infrastructure
| Tool | Purpose |
|------|---------|
| NeonDB (PostgreSQL) | Cloud-hosted database |
| Vercel | Frontend deployment |
| Railway | Backend deployment |
| Docker | Backend containerization |

---

## Project Structure

```
smart-campus-operation-hub/
├── frontend/                    # React + Vite application
│   └── src/
│       ├── api/                 # All backend API calls (one file per module)
│       ├── components/          # Reusable UI components
│       │   ├── bookings/
│       │   ├── common/          # Navbar, Sidebar, ProtectedRoute, etc.
│       │   ├── notifications/
│       │   ├── resources/
│       │   └── tickets/
│       ├── context/             # AuthContext, ToastContext
│       ├── pages/               # One folder per feature module
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── bookings/
│       │   ├── dashboard/
│       │   ├── notifications/
│       │   ├── profile/
│       │   ├── resources/
│       │   └── tickets/
│       ├── hooks/               # Custom React hooks
│       └── utils/               # Helper functions
│
├── backend/                     # Spring Boot application
│   └── src/main/java/.../
│       ├── controller/          # HTTP endpoints (8 controllers)
│       ├── service/             # Business logic
│       ├── repository/          # Database queries
│       ├── model/               # JPA entities
│       ├── dto/                 # Request and response shapes
│       ├── security/            # JWT filters, OAuth2 handlers
│       ├── config/              # Spring configuration classes
│       ├── enums/               # Status, priority, role enums
│       ├── scheduler/           # Scheduled tasks (SLA checks, etc.)
│       └── exception/           # Custom error handling
│
├── docs/                        # Project documentation and Postman collections
├── Dockerfile                   # Backend container definition
├── vercel.json                  # Frontend deployment config
└── railway.toml                 # Backend deployment config
```

---

## Getting Started

### What you need installed
- Node.js 20 or higher
- Java 21 JDK
- Maven 3.9+
- A PostgreSQL database (local or cloud — NeonDB has a free tier)
- A Google Cloud project with OAuth2 credentials

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/smart-campus-operation-hub.git
cd smart-campus-operation-hub
```

---

### 2. Set up the backend

**Create the environment file:**

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Your PostgreSQL connection string
DB_URL=jdbc:postgresql://your-host/your-database?sslmode=require
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Google OAuth2 — from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT — generate any long random string here
JWT_SECRET=change_this_to_a_long_random_string_at_least_256_bits
JWT_EXPIRATION=86400000

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Where your frontend is running (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Run the backend:**

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`. The first run will take a moment while Maven downloads dependencies. Spring Boot will also auto-create the database tables on startup.

---

### 3. Set up the frontend

**Create the environment file:**

```bash
cd ../frontend
cp .env.example .env
```

Open `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Install dependencies and run:**

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

### 4. First login

1. Open `http://localhost:5173`
2. Click "Sign in with Google"
3. Your account will be created with **pending** status
4. To approve it, connect directly to your database and update the user's status to `APPROVED` and role to `ADMIN` for your first account:

```sql
UPDATE users SET status = 'APPROVED', role = 'ADMIN' WHERE email = 'your@email.com';
```

After that, you can approve future accounts through the admin panel in the app.

---

## API Overview

All API endpoints are under `/api/v1/`. Every request (except login) requires a JWT token in the `Authorization` header: `Bearer <your-token>`.

| Module | Base Path | What it covers |
|--------|-----------|---------------|
| Auth | `/auth` | Google login, token refresh |
| Users | `/users` | User profiles, approval, role changes |
| Tickets | `/tickets` | Create, update, status changes, assignment |
| Comments | `/tickets/{id}/comments` | Discussion threads on tickets |
| Bookings | `/bookings` | Resource reservations |
| Resources | `/resources` | Campus rooms and equipment |
| Notifications | `/notifications` | In-app notification management |
| Analytics | `/analytics` | Dashboard data and reports |

A Postman collection is available at `docs/postman/Tickets.postman_collection.json` to test the ticket endpoints directly.

---

## Authentication Flow

This app uses Google OAuth2 — there are no passwords stored anywhere.

```
1. User clicks "Sign in with Google"
2. Google verifies their identity and redirects back to the app
3. The backend receives the Google token, creates or finds the user account
4. The backend issues its own JWT token (valid for 24 hours)
5. The frontend stores this token and sends it with every API request
6. New accounts are placed in "PENDING" state until an admin approves them
```

The JWT contains the user's ID and role. The backend reads this on every request to decide what the user is allowed to do — so even if someone intercepts a request and tries to call an admin endpoint, the server will reject it based on the role in their token.

---

## Roles and Permissions

| Role | What they can do |
|------|----------------|
| **ADMIN** | Everything — manage users, approve accounts, see all data, delete anything |
| **MANAGER** | See all tickets and bookings, assign technicians, approve bookings, run reports |
| **TECHNICIAN** | See and update tickets assigned to them, add resolution notes |
| **USER** | Report tickets, make bookings, see their own data |

---

## Deploying to Production

### Frontend → Vercel

```bash
# From the frontend folder
vercel --prod
```

Set the same environment variables from your `.env` file in the Vercel dashboard under Project Settings → Environment Variables.

### Backend → Railway

The project includes a `railway.toml` and `Dockerfile`. Push to your Railway project and set the environment variables in the Railway dashboard. Railway will build the Docker image and deploy automatically on every push.

Or deploy with Docker manually:

```bash
# From the backend folder
docker build -t smart-campus-backend .
docker run -p 8080:8080 --env-file .env smart-campus-backend
```

---

## Contributing

If you are working on this project as part of the team:

1. Branch off `main` — use the naming convention `feature/your-feature-name` or `fix/what-you-fixed`
2. Keep PRs focused — one feature or fix per PR
3. Test your changes locally before pushing (run both frontend and backend)
4. The `main` branch is protected — open a pull request and get at least one review before merging

---

## Known Limitations

A few things worth being upfront about:

- **File uploads** are stored on the local server filesystem. In production on Railway, files will disappear on redeploy. A proper setup would use an S3 bucket or similar — this is on the backlog.
- **The triage AI** is keyword-based, not a real machine learning model. It works well for obvious cases but will miss unusual descriptions.
- **WebSocket notifications** are partially implemented — the UI shows notifications but real-time push is not fully wired up end to end.
- **H2 database** is included as a test dependency but the test suite is minimal.

---

## License

This is a university project submitted in partial fulfillment of the requirements for the BSc (Hons) in Information Technology at SLIIT. All rights reserved.

---

*Built by the Smart Campus team — SLIIT, 2025*
