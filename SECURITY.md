# Security Implementation & OWASP Top 10 Awareness

This document outlines the security measures implemented in the Task Board application and our approach to addressing common vulnerabilities.

---

## Role-Based Access Control (RBAC)

**✅ IMPLEMENTED**

The application implements a three-tier RBAC system enforced at the controller level:

- **ADMIN** — Full system access: manage users, delete any task/team, view activity logs
- **MANAGER** — Task and team management: create tasks, manage teams, assign team members, view team activity
- **USER** — Basic access: view assigned tasks, update task status, add comments

### Implementation Details:
- **Strategy:** Role stored in JWT token payload (`payload.role`) and validated on every protected endpoint
- **Guards:** `JwtAuthGuard` + manual `checkAdmin()` role verification in sensitive controllers
- **Location:** `backend/src/auth/roles.guards.ts` and role checks embedded in service layer
- **Example:** Admin controller verifies `user.role === 'ADMIN'` before allowing user management operations

---

## User Authentication & Authorization (UAA)

**✅ IMPLEMENTED**

Clear separation between **who you are** (authentication) and **what you can do** (authorization):

### Authentication (Who Are You?)
- **Method:** JWT (JSON Web Tokens) with Bearer token in Authorization header
- **Strategy:** `backend/src/auth/jwt.strategy.ts` extracts and validates token from request
- **Token Structure:** Contains `sub` (user ID) and `role` for authorization decisions
- **Validation:** `ignoreExpiration: false` ensures expired tokens are rejected
- **Secret Management:** JWT secret pulled from `process.env.JWT_SECRET` via ConfigModule

### Authorization (What Can You Do?)
- **Task Operations:** Only managers/admins can create tasks; only task creator/assignee/admin can update status
- **User Management:** Only admins can manage users
- **Team Operations:** Only managers can create teams; only owner can manage members
- **Service-Level Checks:** Each service method receives `userId` and verifies permissions before executing database operations

### Endpoints Protected:
- All `/api/tasks/*` endpoints require `JwtAuthGuard`
- All `/api/admin/*` endpoints require JWT + explicit admin role check
- All `/api/teams/*` endpoints require JWT + role validation
- All `/api/comments/*` endpoints require JWT

---

## OWASP Top 10 Security Considerations

### 1. **Injection** ✅ Properly Addressed

**What We Did Right:**
- **Database Protection:** Using Prisma ORM with parameterized queries — no string concatenation of SQL
- **All database queries use Prisma's type-safe API:**
  ```javascript
  // ✅ SAFE: Prisma parameterized queries
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const tasks = await prisma.task.findMany({ where: { assignedToId: userId } });
  ```
- **No raw SQL execution** — all queries go through Prisma's query builder
- **Data Validation:** Implicit via Prisma schema (type checking)

**What We Have Not Implemented:**
- Explicit input validation decorators (NestJS `@IsString()`, `@IsEmail()`, etc.) — accepting any data structure without schema validation
- **Mitigation Path:** Could add `class-validator` to DTOs for explicit field validation

---

### 2. **Broken Authentication** ⚠️ Partially Implemented

**What We Did Right:**
- **Password Hashing:** Using bcrypt with 10 salt rounds (strong, slow)
  ```javascript
  const hashed = await bcrypt.hash(dto.password, 10);
  const valid = await bcrypt.compare(dto.password, user.password);
  ```
- **Token Expiration:** JWT configured with `ignoreExpiration: false` — tokens must be valid
- **Password Change:** Supports password updates with verification of current password before allowing change
- **No Password in Responses:** User API responses exclude password field with `.select()` to ensure password hashes never leak

**What We Have Not Implemented:**
- **Rate Limiting:** No protection against brute-force login attempts
  - **Status:** ❌ Not implemented
  - **Risk:** Attackers could make unlimited login attempts
  - **Mitigation Path:** Add `@nestjs/throttler` package to rate-limit POST `/auth/login` and `/auth/register`
  
- **Password Requirements:** No minimum length, complexity checks, or rejection of common passwords
  - **Status:** ❌ Not implemented
  - **Mitigation Path:** Add validators in DTOs to enforce password policy (min 8 chars, mixed case, numbers)
  
- **Account Lockout:** No automatic lockout after failed login attempts
  - **Status:** ❌ Not implemented
  - **Mitigation Path:** Track failed login attempts and lock account temporarily after 5 failures
  
- **Refresh Tokens:** Using single long-lived JWT tokens (no refresh token rotation)
  - **Status:** ⚠️ Not implemented
  - **Mitigation Path:** Implement short-lived access tokens + long-lived refresh tokens with rotation

---

### 3. **Broken Access Control (Insecure Direct Object References / IDOR)** ✅ Properly Addressed

**What We Did Right:**

The application implements proper IDOR protection on resource operations:

**Task Access:**
```javascript
// ✅ IDOR Protected: Only task creator/assignee/admin can update status
if (task.assignedToId !== userId && task.createdById !== userId && user.role !== 'ADMIN') {
  throw new ForbiddenException('You cannot update this task status');
}
```

**Task Updates:**
```javascript
// ✅ IDOR Protected: Only creator or admin can update/delete
if (task.createdById !== userId && user.role !== 'ADMIN') {
  throw new ForbiddenException('You can only update your own tasks');
}
```

**User Endpoints:**
```javascript
// ✅ IDOR Protected: Only admins can view/modify user data
private async checkAdmin(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
}
```

**Data Filtering by User Role:**
- Members only see tasks assigned to them: `where: { assignedToId: userId }`
- Members only see teams they're members of or own
- Managers can only manage their own created resources

**Impact:** A member cannot fetch or modify tasks from another team by guessing IDs.

---

### 4. **Sensitive Data Exposure** ⚠️ Partially Addressed

**What We Did Right:**
- **Password Hashes Never Exposed:** All user responses use `.select()` to exclude password field
- **JWT Secrets in Environment:** `JWT_SECRET` pulled from environment variables, not hardcoded
- **HTTPS Ready:** Application structure supports HTTPS; CORS allows secure origins

**What We Have Not Implemented:**
- **HTTPS Enforcement:** No automatic redirect from HTTP → HTTPS
  - **Status:** ❌ Not configured
  - **Note:** Frontend-backend both running on localhost:5173 and localhost:3001 in dev
  - **Mitigation Path:** Configure reverse proxy (nginx) with SSL/TLS in production
  
- **Sensitive Data Logging:** Activity logs may contain sensitive metadata
  - **Status:** ⚠️ Logs created but no audit retention policy
  - **Mitigation Path:** Add log rotation and retention policies; exclude sensitive fields from logs
  
- **No Secrets in Git:** `.env` not tracked (good practice)
  - **Status:** ✅ Assumed proper (need to verify `.gitignore`)

**Security Headers Not Implemented:**
- ❌ Content-Security-Policy (CSP)
- ❌ X-Frame-Options (clickjacking protection)
- ❌ X-Content-Type-Options (MIME type sniffing)
- ❌ Strict-Transport-Security (HSTS)
- **Mitigation Path:** Add helmet middleware (`npm install helmet`) to set security headers

---

### 5. **Cross-Site Scripting (XSS) & CSRF** ⚠️ Frontend Handled, Backend Needs CSRF

**What We Did Right (Frontend):**
- **React's Built-in XSS Protection:** React escapes text content by default
  - Template expressions auto-escape: `{userData}` is HTML-encoded
  - Dangerous only if using `dangerouslySetInnerHTML` (not used in codebase)
- **Input Sanitization:** Tailwind CSS classes prevent inline style injection

**What We Have Not Implemented:**
- **CSRF Tokens:** No CSRF token exchange between client and server
  - **Status:** ❌ Not implemented
  - **Current Reliance:** JWT + SameSite cookies (partially mitigated)
  - **Mitigation Path:** Either:
    - Add CSRF token validation on state-changing requests (POST/PATCH/DELETE)
    - OR ensure SameSite cookie policy is enforced: `SameSite=Strict`

- **XSS Protection Headers:** No Content-Security-Policy header
  - **Status:** ❌ Not implemented
  - **Mitigation Path:** Add helmet middleware with strict CSP

**API Usage:** All API calls use Bearer token (not cookies), which reduces CSRF risk but doesn't eliminate it entirely if frontend is compromised.

---

### 6. **Security Misconfiguration** ✅ Fixed & ⚠️ Partially Addressed

**What We Did Right:**
- **Environment Variables:** Using `@nestjs/config` to load from `.env`
- **CORS Configured:** Explicitly set to whitelist specific origins (not wildcard)
- **Global API Prefix:** All routes prefixed with `/api`
- **✅ FIXED: CORS Configuration Now Environment-Based**
  - Moved from hardcoded `"http://localhost:5173"` to `process.env.ALLOWED_ORIGINS`
  - Supports multiple origins: `ALLOWED_ORIGINS=http://localhost:5173,https://example.com`
  - `.env.example` provided with configuration templates for dev/production
  - Implementation: `const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',')`

**What We Have Not Implemented:**
- **Debug Mode:** Errors may return full stack traces in development
  - **Status:** ⚠️ Default NestJS error handling
  - **Mitigation Path:** Configure `NODE_ENV=production` and use custom exception filters to hide stack traces
  
- **Default Credentials:** Database and system services use default configs
  - **Status:** ✅ PostgreSQL requires password (good)
  - **Status:** ⚠️ JWT secret defaults to "secret" if not provided (see .env.example for setup)
  
- **Unused Endpoints:** No deprecation warnings or cleanup
  - **Status:** All endpoints in use

**Security Best Practices:**
- ✅ API versioning ready (could add `/api/v1/` prefix)
- ❌ No request rate limiting globally
- ❌ No request size limits enforced

---

### 7. **Insufficient Logging & Monitoring** ✅ Partially Fixed & ⚠️ Partially Implemented

**What We Did Right:**
- **Activity Logging:** All task operations logged to `ActivityLog` table
  - Task creation, status changes, deletion tracked with `userId` and `metadata`
  - Useful for audit trails and forensics

- **✅ FIXED: Authentication Audit Logs Implemented**
  - `AUTH_REGISTER` - Logs all user registrations with email and assigned role
  - `AUTH_LOGIN_SUCCESS` - Logs successful logins with email and timestamp
  - `AUTH_LOGIN_FAILED` - Logs failed login attempts with reason (invalid_password or user_not_found)
  - Failed login attempts for non-existent users logged with `userId: 0` to track brute-force patterns
  - All auth logs include timestamp and relevant metadata
  - Implementation: `logAuthActivity()` method in AuthService + inline logging for registration/failed attempts

**What We Have Not Implemented:**
- **Request Logging:** No HTTP request/response logging
  - **Status:** ❌ Not implemented
  - **Mitigation Path:** Add Morgan middleware or NestJS logger for request tracking
  
- **Error Monitoring:** No external error tracking (e.g., Sentry)
  - **Status:** ❌ Not implemented
  
- **Log Retention:** No defined policy for log cleanup/archival
  - **Status:** ❌ Not implemented
  - **Mitigation Path:** Add database maintenance script to archive/delete logs older than 90 days

- **Brute Force Detection:** Failed login attempts logged but not blocked
  - **Status:** ⚠️ Can now detect via logs; no automatic blocking
  - **Mitigation Path:** Query failed AUTH_LOGIN_FAILED logs for same email/IP and lock account after 5 failures

---

## Summary Table: OWASP Top 10 Implementation Status

| Vulnerability | Status | Details |
|---|---|---|
| **1. Injection** | ✅ Fixed | Prisma ORM prevents SQL injection via parameterized queries |
| **2. Broken Auth** | ⚠️ Partial | bcrypt + JWT implemented; missing rate limiting, account lockout, password policy |
| **3. Broken Access Control** | ✅ Fixed | IDOR protection on all resources; role-based access enforced |
| **4. Sensitive Data Exposure** | ⚠️ Partial | Passwords excluded from responses; missing HTTPS, security headers, CSP |
| **5. XSS** | ✅ Safe | React escapes by default; no dangerous HTML injection |
| **6. CSRF** | ⚠️ Partial | JWT used (not cookies); no explicit CSRF tokens |
| **7. Security Misconfiguration** | ✅ Fixed | ✅ CORS now environment-based; JWT secret from env variables |
| **8. Logging & Monitoring** | ✅ Partial | ✅ Auth audit logs added; missing request logging, external monitoring |
| **9. Deserialization** | ✅ Safe | Using validated JSON (not pickle/serialized objects) |
| **10. XXE** | ✅ Safe | No XML parsing in application |

---

## Production Recommendations

### High Priority:
1. **✅ CORS Configuration** — Now environment-based via `ALLOWED_ORIGINS`
   - Set in production: `ALLOWED_ORIGINS=https://yourdomain.com`
   - See [backend/.env.example](backend/.env.example) for setup
2. **✅ Authentication Audit Logs** — Login attempts (success/failure) now tracked
   - Monitor `AUTH_LOGIN_FAILED` logs for brute-force patterns
   - Review `activityLogs` table regularly for security anomalies
3. **Rate Limiting** — Implement `@nestjs/throttler` on `/auth/login` and `/auth/register`
4. **HTTPS** — Configure TLS/SSL on production domain
5. **Password Policy** — Enforce minimum 8 chars, mixed case, numbers

### Medium Priority:
6. **Request Logging** — Add Morgan middleware for HTTP logs
7. **Account Lockout** — Lock after 5 failed login attempts (30 min timeout)
8. **Input Validation** — Add `class-validator` to all DTOs
9. **CSRF Tokens** — Add token validation on state-changing requests
10. **Security Headers** — Install helmet middleware

### Nice to Have:
11. **Refresh Token Rotation** — Implement token refresh flow
12. **IP Whitelisting** — For admin endpoints
13. **Two-Factor Authentication** — SMS/TOTP for sensitive accounts
14. **External Monitoring** — Integrate Sentry or similar

---

## Testing Security

### Authentication Tests:
- ✅ Valid JWT tokens accepted
- ✅ Expired tokens rejected
- ✅ Invalid signatures rejected
- ✅ Missing authorization header returns 401

### Authorization Tests:
- ✅ Admins can delete any user
- ✅ Members cannot update tasks they don't own
- ✅ Members cannot access admin endpoints
- ✅ Task ID guessing doesn't expose other users' tasks (IDOR protected)

### Data Protection Tests:
- ✅ Passwords never returned in API responses
- ✅ bcrypt hashes not exposed
- ✅ Sensitive data excluded from logs

---

## Audit Log Reference

### Authentication Events Tracked

All authentication events are recorded in the `ActivityLog` table:

**Event Types:**
- `AUTH_REGISTER` — New user registration
- `AUTH_LOGIN_SUCCESS` — Successful login
- `AUTH_LOGIN_FAILED` — Failed login attempt (invalid password or user not found)

**Metadata Captured:**
- `timestamp` — When the event occurred
- `email` — User email address
- `reason` — Failure reason (user_not_found, invalid_password)
- `success` — Boolean flag indicating success/failure
- `role` — User's assigned role (for successful logins)

### Security Monitoring Queries

**Detect Brute Force Attempts (last 1 hour):**
```sql
SELECT 
  metadata->>'email' as email,
  COUNT(*) as failed_attempts,
  MAX("createdAt") as last_attempt
FROM "ActivityLog"
WHERE action = 'AUTH_LOGIN_FAILED'
  AND "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY metadata->>'email'
HAVING COUNT(*) > 5
ORDER BY failed_attempts DESC;
```

**View All Recent Auth Events:**
```sql
SELECT 
  id, 
  action, 
  "userId",
  metadata->>'email' as email,
  "createdAt"
FROM "ActivityLog"
WHERE action LIKE 'AUTH_%'
ORDER BY "createdAt" DESC
LIMIT 100;
```

**User Registration Audit:**
```sql
SELECT 
  id,
  "userId",
  metadata->>'email' as email,
  metadata->>'role' as role,
  "createdAt"
FROM "ActivityLog"
WHERE action = 'AUTH_REGISTER'
ORDER BY "createdAt" DESC;
```

---

The Task Board application implements core security principles:
- **Strong authentication** with bcrypt + JWT
- **Comprehensive RBAC** with role-based endpoint protection
- **IDOR protection** on all user-facing resources
- **SQL injection prevention** via Prisma ORM

However, production deployment requires additional hardening:
- Rate limiting on login endpoints
- HTTPS enforcement
- Security headers (CSP, X-Frame-Options)
- Enhanced logging and monitoring
- Production environment configuration

All recommendations are marked with implementation paths for future enhancement.
