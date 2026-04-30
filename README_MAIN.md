# Task Board - Full-Stack Application

A role-based task management system with real-time collaboration, built with React, NestJS, PostgreSQL, and Prisma.

---

## 🚀 Quick Start - Copy & Paste

### Prerequisites
- Docker & Docker Compose installed
- Git installed

### Run Locally (One Command)

```bash
# Clone the repository
git clone <repo-url>
cd Task-board

# Start everything with Docker Compose
docker compose up --build

# Wait for "Backend running on port 3002" message in logs
# Then open browser to http://localhost:5173
```

**That's it!** The application will:
- ✅ Start PostgreSQL database with auto-seed
- ✅ Run NestJS backend on `http://localhost:3002/api`
- ✅ Serve React frontend on `http://localhost:5173`
- ✅ Create admin user automatically (see credentials below)

**Stop everything:** `Ctrl+C` then `docker compose down`

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Dashboards: Admin | Manager | Member                   │   │
│  │  - Task Management | Team Management | Activity Logs     │   │
│  │  - Authentication & Authorization via JWT              │   │
│  └──────────────────────────────────────────────────────────┘   │
│              │                                                   │
│              │ HTTP/REST API Calls                              │
│              │ Authorization: Bearer Token (JWT)                │
│              │                                                   │
└──────────────┼───────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (NestJS + Express)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Controllers & Routes:                                  │   │
│  │  - /auth: Register, Login, Profile Management          │   │
│  │  - /tasks: CRUD, Status Updates, Assignments           │   │
│  │  - /teams: Create, Manage Members, Ownership           │   │
│  │  - /admin: User Management, Activity Logs              │   │
│  │                                                         │   │
│  │  Security:                                             │   │
│  │  - JWT Authentication & Validation                     │   │
│  │  - Role-Based Access Control (RBAC)                    │   │
│  │  - Input Validation (class-validator)                  │   │
│  │  - Rate Limiting (10 req/60s per IP)                   │   │
│  │  - Security Headers (Helmet)                           │   │
│  │  - Bcrypt Password Hashing                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│              │                                                   │
│              │ Prisma ORM (Parameterized Queries)               │
│              │ - No SQL Injection Risk                          │
│              │                                                   │
└──────────────┼───────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tables:                                                │   │
│  │  - User (roles: ADMIN, MANAGER, USER)                   │   │
│  │  - Team (ownership, members)                            │   │
│  │  - Task (assignments, status, creator tracking)         │   │
│  │  - Comment (task collaboration)                         │   │
│  │  - ActivityLog (audit trail for security)               │   │
│  │  - TeamMember (junction for team membership)            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Tech Stack & Why

### **Frontend: React 18 + Vite**
- **Why**: Fast development server, instant HMR, smaller bundles than Create React App. React's component model fits naturally with dashboard UI. Tailwind CSS for rapid responsive styling without custom CSS.
- **Trade-off**: Vite has smaller ecosystem than Webpack; we accept this for 3-5x faster dev startup.

### **Backend: NestJS + Express**
- **Why**: Enterprise-ready framework with dependency injection, decorators for clean code, built-in validation & guards. Strong TypeScript support catches errors at compile time. Modular architecture scales with feature additions.
- **Trade-off**: Higher learning curve than simple Express; we accept this for maintainability as project grows.

### **Database: PostgreSQL + Prisma ORM**
- **Why**: PostgreSQL is battle-tested, supports JSON (for activity logs metadata), full ACID compliance. Prisma provides type-safe queries preventing SQL injection, auto-generates migrations, has excellent dev tools (Prisma Studio).
- **Trade-off**: Prisma adds abstraction layer; raw SQL would be faster but Prisma's safety is worth the small overhead for this project.

### **Authentication: JWT + Bcrypt**
- **Why**: JWT is stateless (no session storage), scalable across multiple backend instances. Bcrypt with 10 salt rounds is slow enough to resist brute-force but fast enough for login (200-300ms). Bearer tokens fit REST API patterns.
- **Trade-off**: No built-in token refresh; we accept simple long-lived tokens for MVP. Production would add refresh token rotation.

### **Authorization: Role-Based Access Control (RBAC)**
- **Why**: Three roles (ADMIN, MANAGER, USER) cover 80% of typical business requirements. Roles stored in JWT payload for zero-latency permission checks. Guards + service-level checks create defense-in-depth.
- **Trade-off**: Attribute-Based Access Control (ABAC) would be more flexible but unnecessary complexity at this stage; RBAC is sufficient and easier to reason about.

### **Containerization: Docker Compose**
- **Why**: Single `docker compose up` ensures same environment across dev/test/prod. PostgreSQL, Redis (future), backend, frontend all orchestrated together. No "works on my machine" problems.
- **Trade-off**: Docker adds 5-10 min setup time on first run; we accept this for consistency and avoiding environment drift.

---

## 🎯 Test Users - Instant Login

The system auto-seeds these accounts on startup. Use any of these to test different role permissions:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@example.com | Admin@12345 | Full system access, user management, delete any task/team |
| **Manager** | manager@example.com | Manager@12345 | Create tasks/teams, manage team members, view team activity |
| **User** | user@example.com | User@12345 | View assigned tasks, update status, add comments |

**Testing Scenarios:**
1. Login as User → create task → error (only managers can create)
2. Login as Manager → create task → assign to user → works
3. Login as Admin → view all users → delete user → audit log recorded
4. Login as Manager1 → try to see Manager2's team → 403 Forbidden (IDOR protected)

---

## 📊 Key Features

### ✅ Authentication & Authorization
- Registration with strong password validation (8+ chars, mixed case, numbers, special chars)
- Login with bcrypt verification
- JWT tokens with role claims
- Protected endpoints with JwtAuthGuard

### ✅ Role-Based Access Control
- **ADMIN**: Full system access, user management, view all activity logs, force delete any resource
- **MANAGER**: Create/update teams, assign team members, create/update tasks, manage own resources
- **USER**: View assigned tasks, update task status, add comments, view team info

### ✅ Task Management
- Create tasks (managers only)
- Assign tasks to team members
- Update task status (NEW → IN_PROGRESS → COMPLETED)
- Add comments with real-time updates
- Automatic activity logging

### ✅ Team Management
- Create teams (managers only)
- Add/remove members
- IDOR protection: members can only see their teams
- Team ownership validation

### ✅ Security & Auditing
- All auth events logged (register, login success/failure)
- Activity logging for task operations
- Brute-force detection queries available (see SECURITY.md)
- Input validation on all endpoints
- Rate limiting (10 req/60s)
- Security headers via Helmet

---

## 🛠️ Development Commands

### Backend
```bash
# From backend directory
npm install                    # Install dependencies
npm run build                  # Build NestJS application
npm run start:dev              # Start with watch mode (nodemon)
npm run test                   # Run unit tests
npx prisma studio             # Open Prisma Studio (DB GUI)
npx prisma migrate dev         # Create/apply migrations
```

### Frontend
```bash
# From frontend directory
npm install                    # Install dependencies
npm run dev                    # Start Vite dev server
npm run build                  # Build for production
npm run preview               # Preview production build
npm run lint                  # ESLint check
```

### Docker
```bash
docker compose up              # Start everything
docker compose up --build      # Rebuild images
docker compose down            # Stop everything
docker compose logs -f backend # Watch backend logs
docker compose exec backend sh # Shell into backend container
```

---

## 📁 Project Structure

```
Task-board/
├── backend/                    # NestJS Application
│   ├── src/
│   │   ├── auth/              # Authentication: JWT, bcrypt, DTOs
│   │   ├── admin/             # Admin dashboard & user management
│   │   ├── task/              # Task CRUD & status management
│   │   ├── team/              # Team management
│   │   ├── comments/          # Task comments
│   │   ├── logs/              # Activity logging
│   │   ├── prisma/            # Prisma client service
│   │   ├── app.module.ts      # Root module with validation pipe, rate limiting, CORS
│   │   └── main.ts            # Bootstrap with Helmet, security headers
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Auto-generated migration files
│   └── package.json
│
├── frontend/                   # React + Vite Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # UI components (Admin, Manager, Tasks, Teams)
│   │   │   ├── pages/         # Page routes
│   │   │   ├── context/       # AuthContext for state management
│   │   │   └── lib/           # API client, utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── docker-compose.yml         # Orchestration config
├── SECURITY.md                # OWASP Top 10 & security implementation
├── README.md                  # This file
└── README_MAIN.md             # Detailed documentation
```

---

## 🔍 Debugging & Known Issues

### Issue: Login returns 401 Unauthorized
**Solution**: Check backend logs for `[LOGIN] Password comparison result: false`. If false, the password wasn't hashed correctly at registration. Clear database and re-register.

**Debug:** Hit `/api/auth/debug/users` endpoint to see all users in database.

### Issue: Rate Limit (429 Too Many Requests)
**Solution**: Wait 60 seconds; global limit is 10 requests per 60 seconds per IP. For development, adjust in `backend/src/app.module.ts` ThrottlerModule config.

### Issue: CORS Error in Browser Console
**Solution**: Check `ALLOWED_ORIGINS` in `.env` matches your frontend URL. Frontend on `localhost:5173` but backend CORS on `localhost:3000`? Add both: `ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000`

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` in both frontend and backend directories. If still broken, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database connection fails
**Solution**: Ensure PostgreSQL container is running: `docker compose logs db`. Check `DATABASE_URL` in `.env` is correct format: `postgresql://user:password@host:port/dbname`

---

## 🚀 Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
JWT_SECRET=<use-strong-random-string>
DATABASE_URL=postgresql://<prod-user>:<prod-pass>@<prod-host>:5432/<prod-db>
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
BACKEND_PORT=3002
FRONTEND_PORT=3000
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT_SECRET (min 32 chars)
- [ ] Configure HTTPS/TLS certificates
- [ ] Update ALLOWED_ORIGINS to production domains
- [ ] Set up automated database backups
- [ ] Enable monitoring & error tracking (Sentry)
- [ ] Review SECURITY.md production recommendations
- [ ] Run security headers check: `curl -I https://api.yourdomain.com`

---

## 📸 Debugging Screenshots & Error Analysis

### Section: How I Solved Critical Issues

*This section is reserved for you to upload debugging screenshots and explain the troubleshooting process. Include:*

1. **Screenshot of Error Message**
   - Backend console output or browser DevTools error
   
2. **Root Cause Analysis**
   - What was the actual problem?
   - Why did it occur?
   
3. **Solution Applied**
   - What changes fixed it?
   - Was it code change or environment config?
   
4. **Lessons Learned**
   - How would you prevent this in the future?
   - What did this teach you about the architecture?

**Example Format:**
```
### Issue: Prisma Validation Error on Team Member Removal

**Screenshot:** [Upload error log screenshot]

**Root Cause:** memberId parameter was undefined because controller parameter 
extraction wasn't matching route pattern. Team member composite key needed 
both teamId AND userId, but only one was provided.

**Solution:** Added validation in service layer to check parameters before 
Prisma call. Fixed route handler to properly extract both path parameters.

**Learned:** Always validate parameters at entry points; small typos in 
controller routes cause hard-to-debug downstream errors.
```

---

## ⚙️ Trade-Offs & What I Would Do With More Time

### Current Limitations (Known Trade-Offs)

#### 1. **Single Long-Lived JWT Tokens (No Refresh Token Rotation)**
- **Current**: JWT tokens don't expire until manual logout
- **Trade-off**: Simpler implementation, no token refresh endpoint needed
- **More time**: Implement short-lived access tokens (15 min) + long-lived refresh tokens (7 days) with rotation on each refresh
- **Why it matters**: If a token leaks, attacker has access for the full token lifetime

#### 2. **No Automatic Account Lockout After Failed Logins**
- **Current**: Failed login attempts are logged but not blocked; rate limiting only applies globally
- **Trade-off**: Simple auth logic; failed login rate limiting happens at global API level
- **More time**: Query failed login attempts per email/IP and lock account after 5 failures within 15 mins
- **Why it matters**: Protects against targeted brute-force attacks on specific user accounts

#### 3. **Activity Logs Stored in Same Database (No Archival)**
- **Current**: All logs accumulate in PostgreSQL, no retention policy
- **Trade-off**: Simpler setup; keeps everything in one DB
- **More time**: Implement log rotation (archive logs >90 days to cold storage like S3) + add Elasticsearch for fast querying
- **Why it matters**: Long-term DB performance and audit compliance

#### 4. **No External Monitoring/Error Tracking**
- **Current**: Errors logged to console only; no automated alerts
- **Trade-off**: Fewer external dependencies; good for MVP
- **More time**: Integrate Sentry for error tracking, New Relic for performance monitoring, PagerDuty for on-call alerts
- **Why it matters**: Production systems need visibility into failures in real-time

#### 5. **No Request/Response Logging Middleware**
- **Current**: Only auth events and task operations logged; HTTP requests not tracked
- **Trade-off**: Simpler logging; less storage needed
- **More time**: Add Morgan middleware to log all HTTP requests with latency, response codes, body sizes
- **Why it matters**: Debugging client issues and detecting suspicious traffic patterns

#### 6. **Responsive Design Incomplete**
- **Current**: Admin dashboard needs mobile responsiveness improvements (Manager & User dashboards mostly done)
- **Trade-off**: Focused on core functionality first; mobile less critical for task management app
- **More time**: Use Tailwind's responsive classes to make all dashboards mobile-first, test on real devices
- **Why it matters**: Users should be able to manage tasks on-the-go

#### 7. **No WebSocket for Real-Time Updates**
- **Current**: Task updates require page refresh or manual fetch
- **Trade-off**: Simpler architecture; REST polling sufficient for MVP
- **More time**: Add Socket.io for real-time notifications: comment added, task assigned, team member joined
- **Why it matters**: Better UX; users see updates immediately without refresh

#### 8. **No CSRF Tokens (Relying on JWT Bearer Tokens)**
- **Current**: All API calls use Bearer token (stateless); CSRF risk minimal but not zero
- **Trade-off**: Simpler than token + cookie approach; JWT bearer is REST API best practice
- **More time**: Add explicit CSRF token validation on state-changing requests (POST/PATCH/DELETE) if frontend moves to cookies
- **Why it matters**: Defense-in-depth; reduces CSRF attack surface

#### 9. **Limited Error Messages in Frontend**
- **Current**: Backend validation errors sent to browser; frontend shows generic "invalid email or password"
- **Trade-off**: Simple UI; privacy-conscious (doesn't reveal which field failed)
- **More time**: Parse backend validation errors and display field-specific messages: "Password must contain uppercase letter"
- **Why it matters**: Better UX; users know what to fix

#### 10. **No Database Triggers or Constraints for Data Integrity**
- **Current**: Relies entirely on application logic (services) to enforce rules
- **Trade-off**: Flexibility; easier to change business logic
- **More time**: Add DB-level constraints: unique email with case-insensitive collation, check constraints for enum values, foreign key cascades
- **Why it matters**: Database itself validates data; corruption less likely even if app has bugs

### Architecture Decisions I'm Proud Of

✅ **Prisma ORM instead of raw SQL**: Catches SQL injection at compile time, type-safe, migrations auto-tracked  
✅ **Activity logging with JSON metadata**: Flexible audit trail; brute-force detection queries easy to write  
✅ **DTO validators before business logic**: Fail fast with clear error messages; invalid data never reaches DB  
✅ **JWT in Bearer header**: Standard REST security; stateless across multiple backend instances  
✅ **IDOR protection at service layer**: Defense-in-depth; even if URL guessing happened, service checks userId ownership  
✅ **Global ValidationPipe + Helmet middleware**: Security & validation applied everywhere automatically, no copy-paste in every endpoint

### What I Would Do Differently

❌ **Start with WebSocket earlier**: REST polling for real-time is band-aid; should have used Socket.io from day 1  
❌ **More comprehensive logging from start**: Would have added Morgan middleware immediately for HTTP request tracking  
❌ **Type-safe DTOs across all endpoints**: Some endpoints still accept `@Body() dto: any`; should have strict DTOs everywhere  
❌ **E2E tests before shipping**: Would have Cypress tests for login flow, task CRUD, IDOR scenarios  
❌ **Database indexing planned upfront**: Currently no indexes on foreign keys or frequently-queried fields; would have planned this in schema design

---

## 📚 Additional Resources

- **Security Deep Dive**: See [SECURITY.md](SECURITY.md) for OWASP Top 10 implementation details
- **API Documentation**: See [API_DOCS.md](API_DOCS.md) for endpoint details (create if needed)
- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup (create if needed)

---

## 📝 License

MIT License - Feel free to use this project as a learning resource.

---

## 🤝 Contributing

Pull requests welcome! Please:
1. Test locally with `docker compose up`
2. Follow existing code style (Prettier + ESLint configured)
3. Add a comment explaining trade-offs in new features

---

**Last Updated:** April 27, 2026  
**Status**: ✅ Ready for MVP deployment | 🚀 Production hardening in progress
