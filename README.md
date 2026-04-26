# Task Board Application

##  How to run it locally

Copy and paste the following block of commands into your terminal to spin up the entire stack locally:

```bash
# 1. Start the PostgreSQL database using Docker
docker-compose up -d postgres

# 2. Setup and run the backend server
cd backend
npm install
npx prisma generate
npx prisma migrate dev
node prisma/seed.js
npm run start:dev &

# 3. Setup and run the frontend application
cd ../frontend
npm install
npm run dev
```

##  Architecture Diagram

```text
+-------------------+       HTTP / REST API      +-----------------------+
|                   |  <---------------------->  |                       |
|   Frontend        |                            |   Backend             |
|   (React, Vite,   |                            |   (NestJS, Passport   |
|    Tailwind CSS)  |                            |    JWT, Prisma ORM)   |
|                   |                            |                       |
+-------------------+                            +-----------------------+
                                                             ^
                                                             |
                                                             | TCP / Prisma
                                                             v
                                                 +-----------------------+
                                                 |                       |
                                                 |   Database            |
                                                 |   (PostgreSQL         |
                                                 |    via Docker)        |
                                                 |                       |
                                                 +-----------------------+
```

##  Tech Choices & Why

**Frontend: React, Vite, and Tailwind CSS**
React provides a robust, component-based architecture that is excellent for building dynamic user interfaces. Vite was chosen over Create React App because it offers an extremely fast development server with instant hot module replacement (HMR) and optimized builds. Tailwind CSS enables rapid, consistent styling directly within the markup via utility classes, preventing the overhead and specificity issues of maintaining large custom CSS files.

**Backend: NestJS**
NestJS was selected for its opinionated, modular architecture that inherently enforces clean code practices and scalability. By leveraging TypeScript, decorators, and a powerful dependency injection system, it makes managing complex enterprise-grade backends straightforward. It also provides excellent out-of-the-box integration with tools like Passport for authentication.

**Database & ORM: PostgreSQL with Prisma**
PostgreSQL is a highly reliable and feature-rich relational database that perfectly handles structured relational data like users, teams, and tasks. Prisma acts as the ORM, bringing a uniquely powerful developer experience through its auto-generated, fully typesafe database client. It also handles schema migrations seamlessly, reducing the friction typically associated with database management.

## ⚖️ Trade-offs and What I Would Do With More Time

**Trade-offs:** 
To deliver a functional MVP quickly, certain advanced architectural features were deferred. For example, authentication currently relies on storing JWT tokens in local storage, which is simple to implement but less secure than using `httpOnly` cookies. Additionally, the application relies on standard REST API polling or manual refreshes rather than real-time bidirectional communication, and automated testing coverage (unit and e2e) was deprioritized in favor of shipping core features. 

**With more time, I would:**
1. **Implement WebSockets:** Integrate Socket.io with NestJS to provide real-time updates when tasks are reassigned or comments are added, so users don't need to refresh the page.
2. **Enhance Security:** Migrate JWT storage to `httpOnly` cookies to protect against XSS attacks, and implement strict rate limiting to prevent brute force attacks.
3. **Add Comprehensive Testing:** Write unit tests for critical backend services using Jest, and implement end-to-end (E2E) testing for the frontend using Cypress or Playwright to ensure regressions aren't introduced.
4. **Implement Caching:** Add a Redis caching layer to optimize database queries for frequently accessed, read-heavy data like team task boards.

## 👥 Test Users

The database is seeded with test accounts for each role so you can log in and test the application instantly.

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@gmail.com` | `admin123` |
| **MANAGER** | `manager@gmail.com` | `manager123` |
| **USER** | `user@gmail.com` | `user123` |

##  Debugging & Handling the Unknown

> *Note from the developer: Below is a space detailing how I approach unknown issues and debug errors encountered during development.*

*(Please upload your screenshots below and explain how you solved the errors)*

### Issue 1: [Upload Screenshot Here]
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 2: [Upload Screenshot Here]
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 3: [Upload Screenshot Here]
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]
