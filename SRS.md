# Software Requirements Specification
## Kevin's Gym — Gym Management Application

---

## 1.1 Project Overview and Purpose

**Application Name:** Kevin's Gym Management App (Family Fitness at Brisbane)

Kevin's Gym is a web-based gym management platform built on the MERN stack (MongoDB, Express, React, Node.js). Its core purpose is to digitise the operational workflows of a small-to-medium fitness centre by replacing manual, paper-based or ad-hoc processes with a centralised, role-aware web application.

The system allows three distinct user groups to interact with the gym's operations:

- **Members** can view their profile, browse available fitness classes, make and cancel bookings, and receive system-wide notifications.
- **Vendors (Instructors/Course Providers)** can publish, edit, and delete their fitness courses, and view notifications sent to them by the admin.
- **Administrators** can manage all user accounts, create new accounts, and broadcast targeted notifications to members, vendors, or all users.

---

## 1.2 Problem Statement and Scope

### Problem Statement

Small fitness centres typically manage member sign-ups, class schedules, and instructor communications through spreadsheets, phone calls, or third-party tools that are either expensive or not purpose-built. This creates friction for members trying to find and book classes, for instructors managing their schedules, and for administrators maintaining accurate records.

Kevin's Gym Management App addresses this by providing a single web-based platform where all three roles can carry out their relevant operations without requiring technical expertise.

### In Scope

| Area | Included |
|------|----------|
| User authentication | Register, login, JWT-based session management |
| Role-based access control | Member, Vendor, Admin roles with separate panels |
| Member class booking | Browse available classes, book and cancel bookings |
| Vendor course management | Create, edit, and delete published courses |
| Admin user management | View, create, update, and delete user accounts |
| System notifications | Admin broadcasts to targeted or all user groups |
| Profile management | View and update personal profile fields |
| Task management | Basic CRUD task tracking for authenticated users |

### Out of Scope

- Payment processing or membership billing
- Real-time scheduling / calendar integration (e.g., Google Calendar sync)
- Mobile native applications (iOS / Android)
- Automated email or SMS notifications to users
- Third-party OAuth login (Google Sign-In button exists but is not implemented)
- Advanced reporting or analytics dashboards
- Waitlist management for fully-booked classes

---

## 1.3 User Characteristics

### Gym Members
- **Role:** End-user consumers of gym services
- **Technical Proficiency:** Low to moderate; comfortable with everyday web apps (social media, online shopping)
- **Goals:** Quickly browse and book fitness classes; view upcoming bookings; receive gym news
- **Key Characteristics:** Wide age range (18–65+); expect a simple, clean interface with minimal steps to complete a booking

### Course Vendors (Instructors / External Course Providers)
- **Role:** Service providers who publish classes via the gym platform
- **Technical Proficiency:** Moderate; familiar with basic form-based web tools
- **Goals:** Publish and manage course listings; keep schedules up to date; receive admin communications
- **Key Characteristics:** May manage multiple concurrent classes; require reliable listing management without requiring admin intervention

### Administrators (Gym Staff)
- **Role:** Internal gym operators responsible for platform governance
- **Technical Proficiency:** Moderate; trained on the system during onboarding
- **Goals:** Maintain accurate user records; add or remove accounts; broadcast operational announcements
- **Key Characteristics:** Small number of users (1–3); require elevated permissions not exposed to other roles; responsible for platform integrity

---

## 1.4 Constraints

### Technical Constraints
- **Runtime Environment:** Node.js 14 (pinned in CI/CD pipeline); forward compatibility with later Node versions is not guaranteed without testing
- **Database:** MongoDB only; the Mongoose ODM is used throughout and no relational database alternative is supported
- **Port Assignment:** Backend runs on port 6001; frontend dev server runs on port 3000 — these ports must be available in any deployment environment
- **JWT Expiry:** Authentication tokens are fixed at 30-day expiry; token refresh is not implemented
- **CORS:** Backend is configured to accept requests from any origin in the current configuration; must be restricted before production deployment

### Business Constraints
- **Single Gym Instance:** The application is designed for a single gym location ("Brisbane") and does not support multi-tenancy
- **Default Admin Seeding:** An initial admin account (`admin@kevinsgym.com`) must be seeded via a setup script before the system is usable
- **No Self-Service Admin Promotion:** Users cannot self-assign the admin role; role assignment is controlled by existing admins only

### Regulatory / Security Constraints
- **Password Storage:** Passwords must never be stored in plain text; bcrypt hashing (minimum 10 salt rounds) is enforced via a Mongoose pre-save hook
- **Authentication Required:** All data-modifying endpoints and profile endpoints must require a valid JWT bearer token
- **Data Minimisation:** User passwords are explicitly excluded from API responses via Mongoose field selection

### Infrastructure Constraints
- **Cloud Hosting:** Intended for deployment on AWS EC2 (single instance or behind an Application Load Balancer)
- **Environment Variables:** `MONGO_URI`, `JWT_SECRET`, and `PORT` must be provided via environment variables — no credentials are to be committed to the repository
- **CI/CD:** GitHub Actions pipeline runs on push/PR to `main`; pipeline must pass before merging

---

## 1.5 Functional Requirements

### Authentication

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall allow a new user to register with a full name, email address, password, and role (Member or Vendor). |
| FR-02 | The system shall reject registration if the provided email address is already associated with an existing account. |
| FR-03 | The system shall allow a registered user to log in with their email and password and receive a JWT access token on success. |
| FR-04 | The system shall reject login attempts with incorrect credentials and return an appropriate error message. |
| FR-05 | The system shall allow an authenticated user to log out, clearing their session token from the client. |
| FR-06 | The system shall redirect users to a role-appropriate panel upon successful login (Member → `/member-panel`, Vendor → `/vendor-panel`, Admin → `/admin`). |

### Profile Management

| ID | Requirement |
|----|-------------|
| FR-07 | The system shall allow an authenticated user to view their profile information (name, email, university, address). |
| FR-08 | The system shall allow an authenticated user to update their profile fields via a full replace (PUT) or partial update (PATCH). |
| FR-09 | The system shall allow an authenticated user to permanently delete their own account. |

### Member Panel

| ID | Requirement |
|----|-------------|
| FR-10 | The system shall display a member's profile summary including membership status on the Member Panel. |
| FR-11 | The system shall display a list of fitness classes the member has booked, showing class ID, classroom, and time. |
| FR-12 | The system shall allow a member to cancel a booked class. |
| FR-13 | The system shall allow a member to navigate to the class booking page from the Member Panel. |
| FR-14 | The system shall display system notifications addressed to the member. |
| FR-15 | The system shall allow a member to flag a notification for attention or delete it from their view. |

### Class Booking

| ID | Requirement |
|----|-------------|
| FR-16 | The system shall display a list of available fitness classes with course vendor, date, and time. |
| FR-17 | The system shall allow a member to search available classes by class name or vendor name. |
| FR-18 | The system shall allow a member to book an available class, moving it from the available list to their booked list. |
| FR-19 | The system shall allow a member to cancel a booked class, returning it to the available list. |

### Vendor Panel

| ID | Requirement |
|----|-------------|
| FR-20 | The system shall allow a vendor to create a new course by entering a name, schedule (days), time, description, and venue. |
| FR-21 | The system shall display all courses published by the currently logged-in vendor. |
| FR-22 | The system shall allow a vendor to edit the details of one of their published courses. |
| FR-23 | The system shall allow a vendor to delete one of their published courses. |
| FR-24 | The system shall display system notifications addressed to the vendor, with the ability to flag or delete them. |

### Admin Dashboard

| ID | Requirement |
|----|-------------|
| FR-25 | The system shall allow an admin to view all registered users, showing their name, email, and role. |
| FR-26 | The system shall allow an admin to create a new user account with an assigned role and a default password. |
| FR-27 | The system shall allow an admin to update any user's profile details and role. |
| FR-28 | The system shall allow an admin to delete any user account from the system. |
| FR-29 | The system shall allow an admin to compose a system notification with a message body and target audience (Members, Vendors, or All). |
| FR-30 | The system shall display all previously sent notifications with their message content and date. |

### Task Management

| ID | Requirement |
|----|-------------|
| FR-31 | The system shall allow an authenticated user to create a task with a title, description, and deadline. |
| FR-32 | The system shall display all tasks belonging to the authenticated user. |
| FR-33 | The system shall allow an authenticated user to edit an existing task. |
| FR-34 | The system shall allow an authenticated user to delete a task. |

---

## 1.6 Non-Functional Requirements

### Performance

| ID | Requirement |
|----|-------------|
| NFR-01 | The system shall respond to API requests within 2 seconds under normal load (up to 100 concurrent users). |
| NFR-02 | The frontend application shall achieve an initial page load time of under 3 seconds on a standard broadband connection (>10 Mbps). |
| NFR-03 | Database queries shall complete within 500 ms for typical operations (single-document read/write). |

### Security

| ID | Requirement |
|----|-------------|
| NFR-04 | All user passwords shall be hashed using bcrypt with a minimum of 10 salt rounds before storage; plain-text passwords shall never be persisted. |
| NFR-05 | All protected API endpoints shall require a valid JWT bearer token; requests without a valid token shall receive an HTTP 401 response. |
| NFR-06 | JWT tokens shall expire after 30 days; the system shall reject expired tokens. |
| NFR-07 | The `JWT_SECRET` and `MONGO_URI` values shall be stored only in environment variables and shall never be committed to the code repository. |
| NFR-08 | CORS configuration shall restrict allowed origins to the known frontend domain(s) in production. |
| NFR-09 | Password fields shall be excluded from all API responses. |

### Usability

| ID | Requirement |
|----|-------------|
| NFR-10 | The application shall be usable on modern desktop browsers (Chrome, Firefox, Edge) without requiring browser plugins. |
| NFR-11 | All data entry forms shall provide immediate visual feedback on submission errors. |
| NFR-12 | Role-specific panels shall be accessible within two clicks from the post-login landing page. |

### Reliability

| ID | Requirement |
|----|-------------|
| NFR-13 | The system shall achieve at least 99% uptime during business hours (6 AM – 10 PM AEST). |
| NFR-14 | The system shall gracefully handle database connection failures by returning an appropriate HTTP 500 response rather than crashing. |

### Maintainability

| ID | Requirement |
|----|-------------|
| NFR-15 | The codebase shall maintain a separation of concerns between routing, controller logic, and data models in the backend. |
| NFR-16 | The CI/CD pipeline shall run automated backend tests on every push to `main`; the pipeline shall block merges on test failure. |
| NFR-17 | All environment-specific configuration shall be externalised to `.env` files; a `.env.example` template shall be provided. |

---

## 1.7 User Interface Wireframes (Low Fidelity)

### Screen 1: Login Page (`/login`)

```
+----------------------------------------------------------+
|  KEVIN'S GYM         Family Fitness at Brisbane  [Email] |
+----------------------------------------------------------+
|                                                          |
|              +----------------------------------+        |
|              |         KEVIN'S GYM             |        |
|              |      Member Sign-In Portal       |        |
|              |                                  |        |
|              |  Email:  [________________________]       |
|              |                                  |        |
|              |  Password: [____________________]         |
|              |                                  |        |
|              |  [ ] Remember Me                 |        |
|              |                                  |        |
|              |  [      Sign In      ]           |        |
|              |  [  Google Sign-In   ] (disabled) |       |
|              |                                  |        |
|              |  Don't have an account?          |        |
|              |  [      Register     ]           |        |
|              +----------------------------------+        |
|                                                          |
+----------------------------------------------------------+
```

### Screen 2: Registration Page (`/register`)

```
+----------------------------------------------------------+
|  KEVIN'S GYM         Family Fitness at Brisbane  [Email] |
+----------------------------------------------------------+
|                                                          |
|              +----------------------------------+        |
|              |      Create Your Account        |        |
|              |                                  |        |
|              |  Full Name: [__________________] |        |
|              |  Email:     [__________________] |        |
|              |  Password:  [__________________] |        |
|              |                                  |        |
|              |  Role:                           |        |
|              |   (•) Gym Member                 |        |
|              |   ( ) Course Vendor              |        |
|              |                                  |        |
|              |  [        Register       ]       |        |
|              |                                  |        |
|              |  Already have an account?        |        |
|              |  [        Sign In        ]       |        |
|              +----------------------------------+        |
|                                                          |
+----------------------------------------------------------+
```

### Screen 3: Member Panel (`/member-panel`)

```
+----------------------------------------------------------+
|  KEVIN'S GYM         Family Fitness at Brisbane  [Logout]|
+----------------------------------------------------------+
| +-----------------+ +----------------+ +---------------+ |
| | MY PROFILE      | | BOOKED CLASSES | | NOTIFICATIONS | |
| |                 | |                | |               | |
| | First Name: ___ | | ID | Room | Time| | ID | Message | |
| | Last Name:  ___ | |----|------|-----| |----|---------| |
| | Email:      ___ | | 01 | R-A  | 9am | | N1 | Gym open| |
| | Phone:      ___ | | 02 | R-B  |10am | | N2 | Schedule| |
| | Since:      ___ | | 03 | R-C  | 2pm | | N3 | Holiday | |
| | Status:  Active | |                | |               | |
| |                 | | [Reschedule]   | | [Flag][Delete]| |
| | [Edit Profile]  | | [Cancel]       | |               | |
| | [Save]          | | [Browse Class] | |               | |
| +-----------------+ +----------------+ +---------------+ |
+----------------------------------------------------------+
```

### Screen 4: Class Booking Page (`/class-booking`)

```
+----------------------------------------------------------+
|  KEVIN'S GYM         Family Fitness at Brisbane  [Logout]|
+----------------------------------------------------------+
|  +-----------------------+  +-------------------------+  |
|  | MY BOOKED CLASSES     |  | AVAILABLE CLASSES       |  |
|  |                       |  |                         |  |
|  | Class | Vendor|Date|Time| | Search: [_____________] |  |
|  |-------|-------|----|----|  |                         |  |
|  | Yoga  | Jane  |Mon |7am | | Class | Vendor|Date|Time|  |
|  | Spin  | Bob   |Wed |6am | |-------|-------|----|----|  |
|  | HIIT  | Sue   |Fri |8am | | Pilat | Kim   |Tue |9am |  |
|  |                       |  | Boxfit| Mark  |Thu |6pm |  |
|  | [Reschedule]          |  | Swim  | Ann   |Sat |8am |  |
|  | [Cancel Booking]      |  |                         |  |
|  |                       |  | [Book Class]            |  |
|  +-----------------------+  +-------------------------+  |
+----------------------------------------------------------+
```

### Screen 5: Vendor Panel (`/vendor-panel`)

```
+----------------------------------------------------------+
|  KEVIN'S GYM         Family Fitness at Brisbane  [Logout]|
+----------------------------------------------------------+
| +------------------+ +-----------------+ +------------+  |
| | CREATE COURSE    | | MY COURSES      | | NOTIFS     |  |
| |                  | |                 | |            |  |
| | Name: [________] | | Course|Day|Time | | Msg | Date |  |
| | Days: [________] | |-------|---|-----| |-----|------|  |
| | Time: [________] | | Yoga  |Mon| 9am | | Cl. | 1/5  |  |
| | Desc: [________] | | Spin  |Wed|6pm  | | Upd | 2/5  |  |
| |       [________] | | HIIT  |Fri|7am  | |            |  |
| | Venue:[v Select] | |                 | |            |  |
| |                  | | [Edit][Delete]  | |[Flag][Del] |  |
| | [Create][Save]   | |                 | |            |  |
| +------------------+ +-----------------+ +------------+  |
+----------------------------------------------------------+
```

### Screen 6: Admin Dashboard (`/admin`)

```
+----------------------------------------------------------+
|  KEVIN'S GYM         Family Fitness at Brisbane  [Logout]|
+----------------------------------------------------------+
| +------------------+ +-----------------+ +------------+  |
| | ADD / EDIT USER  | | ALL USERS       | | SEND NOTIF |  |
| |                  | |                 | |            |  |
| | First: [_______] | | Name|Email|Role | | Msg | Date |  |
| | Last:  [_______] | |-----|-----|-----| |-----|------|  |
| | Email: [_______] | | Ali |a@.. |mem  | | Hi  | 1/5  |  |
| | Role:  [v Select]| | Bob |b@.. |vend | | FYI | 2/5  |  |
| |                  | | Sue |s@.. |adm  | |            |  |
| | [Create][Save]   | |                 | | [Create]   |  |
| |                  | | [Update][Delete]| | [Send]     |  |
| +------------------+ +-----------------+ +------------+  |
+----------------------------------------------------------+
```

---

## 1.8 Complete System Diagram

```
                          USERS (Browser)
                               |
                    HTTPS/HTTP Requests
                               |
                               v
              +-----------------------------+
              |   AWS Application Load      |
              |       Balancer (ALB)        |
              |  (Distributes traffic to    |
              |   EC2 instances)            |
              +-----------------------------+
                      |           |
              +-------+           +-------+
              v                           v
   +--------------------+     +--------------------+
   |   AWS EC2 Instance |     |   AWS EC2 Instance |
   |  (Node.js / PM2)   |     |  (Node.js / PM2)   |
   |                    |     |                    |
   | +----------------+ |     | +----------------+ |
   | | React Frontend | |     | | React Frontend | |
   | | (Static Build) | |     | | (Static Build) | |
   | | Port: 3000 /   | |     | | Port: 3000 /   | |
   | | served by Expr.| |     | | served by Expr.| |
   | +-------+--------+ |     | +-------+--------+ |
   |         | API calls |     |         | API calls |
   |         v           |     |         v           |
   | +----------------+ |     | +----------------+ |
   | | Express Backend| |     | | Express Backend| |
   | |  Port: 6001    | |     | |  Port: 6001    | |
   | | /api/auth      | |     | | /api/auth      | |
   | | /api/admin     | |     | | /api/admin     | |
   | | /api/tasks     | |     | | /api/tasks     | |
   | +----------------+ |     | +----------------+ |
   +--------------------+     +--------------------+
              |                           |
              +------+      +-------------+
                     |      |
                     v      v
          +------------------------------+
          |       MongoDB Atlas          |
          |   (Cloud-hosted Database)    |
          |                              |
          |  Collections:                |
          |   - users  (User model)      |
          |   - tasks  (Task model)      |
          +------------------------------+

  +-----------------+           +----------------------+
  |  GitHub Repo    |           |  GitHub Actions CI   |
  |                 |  push/PR  |  (.github/workflows/ |
  | main branch     +---------->|   ci.yml)            |
  | feature/* branch|           |                      |
  |                 |           | 1. npm install       |
  |  Source Code:   |           | 2. npm test          |
  |  - backend/     |           |    (Mocha/Chai)      |
  |  - frontend/    |           | 3. Pass/Fail check   |
  +-----------------+           +----------------------+

  DATA FLOW SUMMARY
  -----------------
  Browser  -->  ALB  -->  EC2 (React SPA, static files)
  Browser  -->  ALB  -->  EC2 (Express API, /api/*)
  Express  <-->  MongoDB Atlas  (Mongoose ODM)
  Express  -->  JWT token  -->  Browser (AuthContext)
  Browser  -->  Bearer token in header  -->  Express (protect middleware)
  GitHub push  -->  CI pipeline  -->  Tests pass/fail
```

### Component Descriptions

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Browser Client | React 18, React Router v6, Axios, Tailwind CSS | Single-page application; role-based UI panels |
| AWS ALB | AWS Application Load Balancer | Distributes HTTPS traffic across EC2 instances; SSL termination |
| AWS EC2 | Node.js 14 + PM2 | Hosts both the Express API and serves the built React SPA |
| Express Backend | Express.js, JWT, bcrypt | REST API; authentication, user management, task management |
| MongoDB Atlas | MongoDB (Mongoose ODM) | Persistent storage for users and tasks |
| GitHub | Git repository | Version control; source of truth for all code |
| GitHub Actions | CI/CD workflow | Automated testing on every push/PR to `main` |

---

*Document Version: 1.0 — Kevin's Gym Management App*
