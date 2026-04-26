# Task Board

A role-based task management application with teams, comments, and activity logs.

---

## Table of Contents

1. [Run Locally](#run-locally)
2. [Architecture](#architecture)
3. [Tech Choices and Why](#tech-choices-and-why)
4. [Trade-offs & What I Would Do With More Time](#trade-offs--what-i-would-do-with-more-time)
5. [Test Users](#test-users)

---

## Run Locally

> **Prerequisites:** [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
# 1. Clone the repo
git clone https://github.com/tina-codertz/task-board.git
cd task-board

# 2. Create the root .env file (Docker Compose reads this)
cat > .env <<'EOF'
POSTGRES_USER=taskuser
POSTGRES_PASSWORD=taskpass
POSTGRES_DB=taskboard
DATABASE_URL=postgresql://taskuser:taskpass@postgres:5432/taskboard
BACKEND_PORT=3001
FRONTEND_PORT=5173
JWT_SECRET=change_me_in_production
ALLOWED_ORIGINS=http://localhost:5173
EOF

# 3. Build and start all services
docker compose up --build -d

# 4. Run migrations and seed test accounts
docker compose exec backend npx prisma migrate deploy
docker compose exec backend node prisma/seed.js

# 5. Open the app
open http://localhost:5173   # macOS
# or visit http://localhost:5173 in your browser
```

**Without Docker (manual setup):**

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env          # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
node prisma/seed.js
npm run start:dev             # http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│           React 19 + Vite + Tailwind CSS            │
│         (served by Nginx on port 5173/80)           │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP/REST  (JWT in header)
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Backend API                      │
│         NestJS (Node.js) on port 3001               │
│  ┌──────────┐ ┌──────┐ ┌──────┐ ┌───────────────┐  │
│  │   Auth   │ │Tasks │ │Teams │ │Comments/Logs  │  │
│  └──────────┘ └──────┘ └──────┘ └───────────────┘  │
│           Passport JWT · Helmet · Throttler         │
└──────────────────────┬──────────────────────────────┘
                       │  Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│               PostgreSQL 15                         │
│  Users · Teams · TeamMembers · Tasks                │
│  Comments · ActivityLogs                            │
└─────────────────────────────────────────────────────┘
```

All three services run as Docker containers orchestrated by Docker Compose.

---

## Tech Choices and Why

### NestJS (Backend)
NestJS is an opinionated Node.js framework built on top of Express with TypeScript-first support. It was chosen because its module/controller/service pattern enforces a clean separation of concerns that scales well as features grow. Decorators like `@Roles()` and `@UseGuards()` made wiring up role-based access control declarative and easy to audit. Helmet and the built-in Throttler were trivial to add as app-wide guards.

### Prisma ORM
Prisma generates a fully type-safe client from a single `schema.prisma` file, which acts as the authoritative source of truth for both the database schema and the TypeScript types. Migration history is versioned in code, making schema changes reviewable and reproducible across environments. The trade-off is that Prisma's query API is more opinionated than raw SQL, but for a CRUD-heavy app like this the productivity gain is worth it.

### React 19 + Vite + Tailwind CSS (Frontend)
React's component model and context API were sufficient for the state management needs here — no Redux was needed. Vite replaced Create React App because its ESM-native dev server starts near-instantly and hot-module replacement is significantly faster. Tailwind CSS 4 was used for utility-first styling; it keeps component files self-contained and removes the need to context-switch into separate stylesheet files.

### PostgreSQL
PostgreSQL was chosen over a document store because the data model has clear relational structure: users belong to teams, tasks belong to users and teams, and comments belong to tasks. Foreign-key constraints and `onDelete: Cascade` rules keep referential integrity without application-level cleanup logic.

### JWT Authentication
Stateless JWT tokens fit a frontend/backend split architecture because the API can be scaled horizontally without a shared session store. Tokens carry the user's `id` and `role`, which is everything the guards need to make authorization decisions on every request without a database roundtrip.

---

## Trade-offs & What I Would Do With More Time

### What I shipped vs what I would have shipped

| Area | What's there now | What I would add |
|---|---|---|
| **Testing** | Scaffolded Jest config, no coverage | Unit tests for service methods; integration tests hitting a test DB |
| **Refresh tokens** | Single access token, no expiry strategy | Short-lived access token + refresh token stored in an HttpOnly cookie |
| **Error handling** | Basic NestJS exceptions | Centralized exception filter with consistent `{ code, message, details }` envelope |
| **Seed script** | Creates 3 static users with `upsert` | Full seed with teams, sample tasks, and comments so reviewers see a non-empty board |
| **Activity logs** | Written to DB, not surfaced in UI | Log viewer in the Admin dashboard with filtering by user/action |
| **Pagination** | All list endpoints return all rows | Cursor-based pagination on tasks, comments, and logs |
| **Input validation** | `ValidationPipe` + `class-validator` on some DTOs | DTOs for every endpoint with strict validation |
| **HTTPS / prod hardening** | HTTP only, `.env` has a placeholder secret | TLS termination in Nginx, secrets from a vault, rate-limit tuning |

### Decisions I'm uncertain about
- **Prisma as `any` casts** — several service files cast `this.prisma` to `any` to call the generated client. This is a workaround for a module resolution quirk with ESM + Prisma v7. I would take the time to resolve the root import issue properly rather than suppressing types.
- **Throttler limit** — 10 requests per 60 seconds is very aggressive for a real app. It was set low to demonstrate the feature; in production the limit and the exempted routes would be tuned to actual traffic patterns.
- **`userId: 0` for anonymous failed logins** — The auth service logs failed login attempts with a hardcoded `userId: 0`. This is a quick hack; the `ActivityLog.userId` foreign key should either be made nullable for unauthenticated events or a separate `SecurityEvent` table should be used.

---

## Test Users

The seed script creates one account per role. After running `node prisma/seed.js` (see [Run Locally](#run-locally)):

| Role | Email | Password | What they can do |
|---|---|---|---|
| **ADMIN** | `admin@taskboard.com` | `admin123` | Manage users, change roles, create/delete any task, view activity logs |
| **MANAGER** | `manager@taskboard.com` | `manager123` | Create teams, create and assign tasks, manage team members |
| **USER** (member) | `member@taskboard.com` | `member123` | View assigned tasks, update task status, add comments |

> All passwords are bcrypt-hashed (cost factor 10) before being stored. Never reuse these credentials in a production environment.
