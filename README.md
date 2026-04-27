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

npm run start:dev &

# 3. Setup and run the frontend application
cd ../frontend
npm install
npm run dev
```

##  Project Structure

```text
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── context/
│   │   │   ├── components/
│   │   │   │   ├── tasks/
│   │   │   │   ├── layout/
│   │   │   │   ├── admin/
│   │   │   │   ├── manager/
│   │   │   ├── lib/
│   │   │   ├── pages/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboards/
│   │   │   ├── routes/
│   │   ├── assets/
├── backend/
│   ├── test/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   ├── 20260424190621_add_tasks_comments_logs_and_teams/
│   │   │   ├── 20260424110411/
│   │   │   ├── 20260424113928_modifying_table_user/
│   ├── src/
│   │   ├── comments/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   ├── prisma/
│   │   ├── admin/
│   │   ├── logs/
│   │   ├── team/
│   │   ├── task/
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
 then allow admin to create the manager 
 for accesing members dashboard just register the account, the  default role is of user(member) 
##  Debugging & Handling the Unknown

> *Note from the developer: Below is a space detailing how I approach unknown issues and debug errors encountered during development.*

*(Please upload your screenshots below and explain how you solved the errors)*

### Issue 1: Authentication Error
![Authentication Error](./screenshots/authentication-error(useauth).png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 2: Authorization Errors
![Authorization Errors](./screenshots/authorization%20erros%20manager%20wanted%20to%20edit%20before%20giving%20him%20the%20permission.png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 3: Database Port Conflict in Dockerization
![Database Port Conflict](./screenshots/database%20port%20conflict%20in%20dockerization.png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 4: Docker Port Conflicts
![Docker Port Conflicts](./screenshots/docker-error%20port%20conflicts.png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 5: Failed to Fetch (Frontend)
![Failed to Fetch](./screenshots/failed%20to%20fetch.png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 6: Failed to Fetch Activity Log
![Failed to Fetch Activity Log](./screenshots/frontend%20failed%20to%20fetch%20activity%20log.png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 7: Docker Port Mapping Failed
![Docker Port Mapping Failed](./screenshots/frontend%20port%20failed%20while%20using%20docker%20was%20mapped%20incorrectly.png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 8: Wrong Backend Port after Dockerization
![Wrong Backend Port](./screenshots/frontend%20was%20hitting%20a%20wrong%20backend%20port%20there%20was%20no%20connection%20with%20the%20backend%20after%20dockerization.png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 9: Typos in Frontend (Backend Title Response)
![Typos in Frontend](./screenshots/mitypos%20in%20the%20frontend%20as%20backend%20was%20not%20giving%20the%20tittle%20as%20response.png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Issue 10: Unable to Fetch Activity Logs
![Unable to Fetch Activity Logs](./screenshots/unabale%20to%20fetch%20activity-logs.png)
**How I solved it:**
[Explain the debugging process, what caused the issue, and the solution]

### Additional Screenshot 1
![Screenshot 2026-04-24 at 22.50.30](./screenshots/Screenshot%202026-04-24%20at%2022.50.30.png)
**Context:**
[Explain this screenshot]

### Additional Screenshot 2
![Screenshot 2026-04-25 at 13.10.59](./screenshots/Screenshot%202026-04-25%20at%2013.10.59.png)
**Context:**
[Explain this screenshot]

### Additional Screenshot 3
![Screenshot 2026-04-25 at 19.31.03](./screenshots/Screenshot%202026-04-25%20at%2019.31.03.png)
**Context:**
[Explain this screenshot]
