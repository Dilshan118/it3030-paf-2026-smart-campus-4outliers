# Smart Campus Operations Hub - System Endpoints & Implementation Analysis

This document provides a plain-English overview of the entire system based on the current codebase and the Software Requirements Specification (SRS). It breaks down what has already been built and what needs to be implemented next.

## Introduction

The **Smart Campus Operations Hub** is a centralized platform for managing resources, bookings, facility incidents, and user notifications. The system handles four main modules:
1. **Module A - Resources:** Managing the campus resources like lecture halls, labs, and equipment.
2. **Module B - Bookings:** Allowing users to seamlessly book available resources without timing conflicts.
3. **Module C - Ticketing:** Reporting maintenance issues with physical resources on campus, along with images and comments.
4. **Module D - Notifications:** Keeping users informed about booking approvals, ticket updates, and comments.

Currently, the foundation of the Spring Boot backend is laid out. Some modules are completely mapped out and functioning, while others are prepared as skeletons to be built next.

---

## 1. 🟢 Module C & D: Currently Implemented Endpoints

The backend development currently has two major modules successfully implemented and fully wired up with their corresponding controller logic: **Maintenance & Incident Ticketing** and **Notifications**.

### 🛠️ Maintenance & Incident Ticketing (`/api/v1/tickets`)
Users can successfully report issues, and technicians or admins can manage tasks.

* **List Tickets:** `GET /` - Fetches a paginated list of tickets (Users see their own, Admins view all).
* **View Single Ticket:** `GET /{id}` - Shows complete details of a specific ticket.
* **Create Ticket:** `POST /` - Creates a new incident report.
* **Update Ticket:** `PUT /{id}` - Updates ticket details (Only allowed for the owner when the ticket is `OPEN`).
* **Delete Ticket:** `DELETE /{id}` - Allows an owner to delete an `OPEN` ticket.
* **Change Status:** `PATCH /{id}/status` - Admins/Technicians can update the status (e.g., to `RESOLVED` or `REJECTED`) and provide resolution notes or rejection reasons.
* **Assign Technician:** `PATCH /{id}/assign` - Admins can assign a specific technician to a ticket.
* **Add Attachment:** `POST /{id}/attachments` - Upload image evidence to a ticket (Max 3 files).
* **Remove Attachment:** `DELETE /{id}/attachments/{aid}` - Deletes a specific screenshot/image from a ticket.

**Ticket Comments (`/api/v1/tickets/{ticketId}/comments`):**
Users can interact on a ticket via comments.
* **Get Comments:** `GET /` 
* **Add Comment:** `POST /`
* **Edit Comment:** `PUT /{commentId}`
* **Delete Comment:** `DELETE /{commentId}`

*Note: While the business logic is wired, user validation relies on placeholders until Authentication is implemented.*

### 🔔 Notifications (`/api/v1/notifications`)
The engine to alert users of any updates is complete.

* **Fetch Notifications:** `GET /` - Gets all notifications for the current user.
* **Unread Count:** `GET /unread-count` - Returns the number of unread alerts.
* **Mark Read:** `PATCH /{id}/read` - Marks a specific alert as read.
* **Mark All Read:** `PATCH /read-all` - Clears the unread badge entirely.
* **Delete Notification:** `DELETE /{id}` - Removes an alert permanently.
* **Get Preferences:** `GET /preferences` - Checks if the user has opted out of certain notification types (like email alerts).
* **Update Preferences:** `PUT /preferences` - Saves new user notification preferences.

---

## 2. ⏳ Module A, B & E: To Be Implemented Next

The following controllers are structured and waiting for the business logic to be actively written. These represent the next major roadmap tasks.

### 🏢 Module A: Facilities & Assets Catalogue (`/api/v1/resources`)
This will act as the "Inventory" system for the campus. Next steps involve managing database entries for physical rooms and equipment.

**Endpoints to Build:**
* `GET /` — List out all resources, allowing users to filter by size/type and paginate through results.
* `GET /{id}` — Fetch detailed info (e.g., capability list, calendar availability) of a single resource.
* `POST /` — Allow Admins to register a brand new resource onto the platform.
* `PUT /{id}` — Let Admins edit resource details.
* `DELETE /{id}` — Soft delete a resource (removing it from the active view but keeping historical data).
* `GET /search` — Custom querying.
* `PATCH /{id}/status` — Let Admins toggle a resource status between `ACTIVE` and `OUT_OF_SERVICE`.

### 📅 Module B: Booking Management (`/api/v1/bookings`)
Once resources are available, users must be able to book them. The major challenge here will be handling **Double-booking Conflict Detection** to ensure overlapping time requests are mathematically blocked.

**Endpoints to Build:**
* `POST /` — Core feature to create a booking. Must run the complex "Overlap Check" SQL logic beforehand to prevent overlaps.
* `GET /` & `GET /{id}` — Fetch and view specific booking details.
* `PUT /{id}` — Let a user modify parameters of a `PENDING` request.
* `DELETE /{id}` — Cancel a booking request.
* `PATCH /{id}/approve` & `PATCH /{id}/reject` — Admin actions to greenlight or reject (with reason) a user booking request.
* `GET /{id}/qr` — Generate a scannable Digital QR Code for approved check-ins.
* `GET /conflicts` — Specifically look up if a prospective time slot is free or booked.

### 🔐 Module E: Auth & Users (`/api/v1/auth` and `/api/v1/users`)
To finalize the security layers and assign roles to the currently hard-coded mock users.

**Endpoints to Build:**
* **Authentication (`/auth`):**
  * `GET /login` — Trigger Google OAuth2 flow.
  * `GET /callback` — Extract the token and initiate session (returns JWT).
  * `POST /refresh` — Refresh the JWT.
  * `POST /logout` — Invalidate user session safely.

* **User Management (`/users`):**
  * `GET /me` & `PUT /me` — Access and alter their own profile settings.
  * `GET /admin/users` — Admin view of all accounts.
  * `PATCH /admin/users/{id}/role` — Admin action to elevate users (e.g. standard USER to TECHNICIAN or MANAGER).

---

## Summary of the Full User Journey (Future State)

When the pending modules are complete, the system will achieve the following flow:
1. **Login:** A User visits the site, hits the Google Login process (`Module E`).
2. **Access:** The system recognizes them as a standard `USER`.
3. **Discover:** The User searches for "Projector" in the active catalog (`Module A`).
4. **Book:** They request it for 2 PM. The backend checks for timing conflicts and allows the `PENDING` request (`Module B`).
5. **Approve:** An Admin sees this booking, approves it (`Module B`), triggering a push notification badge for the user (`Module D`).
6. **Report:** The user later realizes the projector is broken, so they create a new ticket with an photo attached (`Module C`).
7. **Resolve:** A Technician gets assigned and resolves the ticket (`Module C`), triggering an alert (`Module D`) confirming the issue is fixed.
