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
React provides a robust, component-based architecture that is excellent for building dynamic user interfaces. Vite was chosen over Create React App because it offers an extremely fast development server  and optimized builds. Tailwind CSS enables rapid, consistent styling directly within the markup via utility classes, preventing the overhead and specificity issues of maintaining large custom CSS files.

**Backend: NestJS**
NestJS is for its opinionated, modular architecture that inherently enforces clean code practices and scalability. By leveraging TypeScript, decorators, and a powerful dependency injection system, it makes managing complex enterprise-grade backends straightforward. It also provides excellent out-of-the-box integration with tools like Passport for authentication but the most important reason is that its the javascript is my favorite 

**Database & ORM: PostgreSQL with Prisma**
PostgreSQL is a highly reliable and feature rich relational database that perfectly handles structured relational data like users, teams, and tasks. Prisma acts as the ORM, bringing a uniquely powerful developer experience through its auto-generated, fully typesafe database client. It also handles schema migrations seamlessly, reducing the friction typically associated with database management. and i was urged to use postgresql

## Trade-offs 

**Trade-offs:** 
To deliver a functional MVP quickly, certain advanced architectural features were deferred like email verifiction 

## Test Users

The database is seeded with test accounts for each role so you can log in and test the application instantly.

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@gmail.com` | `admin123` |
 then allow admin to create the manager 
 for accesing members dashboard just register the account, the  default role is of user(member) 
##  Debugging & Handling the Unknown

> * Below is a space detailing how I approach unknown issues and debug errors encountered during development.*


### Issue 1: Authentication Error
![Authentication Error](./screenshots/authentication-error(useauth).png)
**How I solved it:**
always wrap the entire main app(app.jsx) with authprovider 

### Issue 2: Authorization Errors
![Authorization Errors](./screenshots/authorization%20erros%20manager%20wanted%20to%20edit%20before%20giving%20him%20the%20permission.png)
**How I solved it:**
the manager wanted to edit the users details and wasnt authorized add access to role manager to so it msy bypass restrictions

### Issue 3: Database Port Conflict in Dockerization
![Database Port Conflict](./screenshots/database%20port%20conflict%20in%20dockerization.png)
**How I solved it:**
environment:
      DATABASE_URL: ${DATABASE_URL}

### Issue 4: Docker Port Conflicts
![Docker Port Conflicts](./screenshots/docker-error%20port%20conflicts.png)
**How I solved it:**
frontend:
    build: ./frontend
    ports:
      - "${FRONTEND_PORT}:80"


### Issue 5: Docker Port Mapping Failed
![Docker Port Mapping Failed]frontend:
    build: ./frontend
    ports:
      - "${FRONTEND_PORT}:80"
  

### Issue 6: Wrong Backend Port after Dockerization
![Wrong Backend Port](./screenshots/frontend%20was%20hitting%20a%20wrong%20backend%20port%20there%20was%20no%20connection%20with%20the%20backend%20after%20dockerization.png)
**How I solved it:**
  PORT: ${BACKEND_PORT}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "${FRONTEND_PORT}:80"
