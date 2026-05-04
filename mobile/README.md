# Task Board Mobile App

Welcome to the **Task Board Mobile App**! This document provides a comprehensive overview of the mobile application's architecture, components, navigation flow, and logic. It is written to be easily understandable for a beginner in Expo, while providing enough depth to present the project confidently to a technical panel.

---

## 📱 Project Overview

This is a mobile application built using **React Native** and **Expo**. It serves as the frontend for a Task Board system, allowing users to log in, view, and manage tasks depending on their roles. 

### Key Technologies:
* **Expo & React Native**: The core framework used to build cross-platform mobile apps using React.
* **Expo Router**: Handles all navigation using a file-based routing system (similar to Next.js).
* **React Context API**: Used for global state management (specifically authentication).
* **Axios / Fetch API**: Connects the mobile app to the Node.js backend to perform CRUD operations.
* **TypeScript**: Provides strong typing to make the codebase predictable and easy to debug.

---

## 🏗️ Architecture & Folder Structure

The app's source code is contained entirely inside the `src/` folder. Here's how it's structured to maintain clean and scalable code:

```text
mobile/src/
├── _context/        # Global state management (AuthContext)
├── _lib/            # Backend communication (API handlers, services)
├── app/             # Screens and Routing (Expo Router)
│   ├── auth/        # Login and Registration screens
│   └── screens/     # Role-based screens (Admin, Manager, Member)
└── components/      # Reusable UI components (Buttons, Cards, Headers)
```

### Why this structure?
By separating the API logic (`_lib`), global state (`_context`), UI pieces (`components`), and pages (`app`), the project achieves **Separation of Concerns**. This means a panel can easily see that the app is scalable; if the API changes, only `_lib` needs updating, not the screens.

---

## 🧭 Navigation & Data Flow (Expo Router)

The app uses **Expo Router** which maps the folder structure directly to navigation routes.

### Role-Based Routing Logic (`app/_layout.tsx`)
The entry point of the app dictates the navigation flow based on whether a user is logged in, and what their role is.
1. **Initial Load**: The app checks if a token exists in local storage.
2. **Not Authenticated**: If no token is found, the user is forced to the `/auth` route (Login/Register).
3. **Authenticated**: If logged in, the `RootLayoutNav` component reads the user's role (`ADMIN`, `MANAGER`, or `USER`) from the `AuthContext` and automatically redirects them to their respective dashboard:
   * **Admin** ➡️ `/screens/admin/dashboard`
   * **Manager** ➡️ `/screens/manager/dashboard`
   * **Member** ➡️ `/screens/member/dashboard`

This ensures that users can never access screens they don't have permission to see.

---

## 🖥️ Screens by Role

### 1. Admin (`app/screens/admin/`)
* **Dashboard**: Overview of system statistics (total users, active teams).
* **Manage Users**: View a list of all users.
* **Create User**: A form to manually create new users and assign them roles (`admin`, `manager`, `user`).
* **Activity Logs & View Tasks/Teams**: Screens to monitor system-wide activities.

### 2. Manager (`app/screens/manager/`)
* **Dashboard**: Overview of tasks and teams they manage.
* **Team Management**: Screens to `create-team`, view `team-detail`, and `add-members-to-team`.
* **Task Management**: Screens to `create-task`, view `task-detail`, and assign tasks to members or entire teams.

### 3. Member (`app/screens/member/`)
* **Dashboard**: Displays a personalized feed of tasks assigned directly to the user.
* **Task Detail**: Allows members to view task descriptions, update their status (TODO ➡️ IN_PROGRESS ➡️ DONE), and add comments.
* **Team Detail**: Allows the member to see which teams they are a part of.

---

## 🧩 Reusable Components (`src/components/`)

Instead of duplicating code across screens, the app uses a modular component system:
* **`DashboardHeader.tsx`**: A consistent top navigation bar across all dashboards.
* **`TaskListItem.tsx` & `TaskListItemWithStatus.tsx`**: Reusable cards to display task titles, priorities, and current statuses dynamically.
* **`UserListItem.tsx`**: A component to display user avatars, names, and emails in lists.
* **`StatCard.tsx`**: Used on dashboards to visually display numbers (e.g., "5 Tasks Pending").

**Design Considerations**: All screens wrap their contents in `SafeAreaView` concepts (via `useSafeAreaInsets`) to ensure the UI never overlaps with the phone's physical notches, status bars, or home indicators on both iOS and Android.

---

## 🧠 State Management & Context (`_context/`)

The application uses the **React Context API** (`AuthContext.tsx`) to handle authentication state globally.

**How it works:**
1. **`AuthProvider`** wraps the entire app in `_layout.tsx`.
2. It holds the `user` object, `isLoading` state, and `error` state.
3. It exposes functions like `login()`, `register()`, and `logout()`.
4. Any screen or component can easily access the logged-in user's details by calling `const { user, logout } = useAuth();`.

This prevents "prop drilling" (passing data down through multiple layers of components) and keeps the user's session globally accessible.

---

## 🔌 API & Backend Communication (`_lib/`)

The mobile app communicates with the backend via the logic defined in `services.ts` and `api.ts`.

### `authenticatedFetch` Wrapper
All API calls are routed through a custom helper function called `authenticatedFetch`. This function:
1. Automatically retrieves the JWT token from `AsyncStorage`.
2. Attaches the token to the `Authorization: Bearer <token>` header of every request.
3. **Global Error Handling**: If the backend returns a `401 Unauthorized` (e.g., the token expired), it automatically clears local storage and forces the app to redirect back to the Login screen.

### API Modules
The endpoints are organized into clean objects inside `services.ts`:
* `adminAPI`: For fetching users, creating users, and viewing logs.
* `taskAPI`: For fetching tasks, updating statuses, and adding comments.
* `teamAPI`: For creating teams and adding members.
* `authAPI`: For login, registration, and profile updates.

This makes calling the backend inside a component as simple as: `await taskAPI.getTaskById(id);`.

---

## 🚀 How to Run the Project Locally

1. **Install Dependencies**: Make sure you are inside the `/mobile` directory and run:
   ```bash
   npm install
   ```
2. **Start the Expo Server**:
   ```bash
   npx expo start
   ```
3. **View the App**: 
   * Download the **Expo Go** app on your physical iOS or Android device.
   * Scan the QR code shown in your terminal.
   * Alternatively, press `i` to open an iOS simulator or `a` to open an Android emulator if you have them installed on your computer.

---

## 🎯 Summary for the Panel
If asked to summarize your understanding, you can say:
> *"This mobile app is a secure, role-based Task Management client built with React Native and Expo Router. It maintains clean separation of concerns by isolating API calls to a services layer, using Context API for global authentication state, and relying on a modular component architecture. The navigation intelligently intercepts users based on their active JWT token and role, ensuring Admins, Managers, and Members only see the data and actions relevant to their permissions."*
