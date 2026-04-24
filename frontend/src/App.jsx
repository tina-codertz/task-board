import React from "react";
import { AuthProvider } from "./app/context/AuthContext";
import { BrowserRouter, Routes,Route } from "react-router-dom";
import Header from "./app/components/layout/Header";
import AuthPage from "./app/pages/auth/AuthPage";
import ProtectedRoutes from "./app/routes/ProtectedRoutes";
import AdminDashboard from "./app/pages/dashboards/AdminDashboard";
import ManagerDashboard from "./app/pages/dashboards/ManagerDashboard";
import MemberDashboard from "./app/pages/dashboards/MemberDashboard";
import { UserProfile } from "./app/pages/dashboards/UserProfile";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        

        <Routes>
         
          <Route path="/" element={<AuthPage />} />

          {/* User Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoutes>
                <UserProfile />
              </ProtectedRoutes>
            }
          />

          {/* protected routes */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoutes>
                <AdminDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/dashboard/manager"
            element={
              <ProtectedRoutes>
                <ManagerDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/dashboard/member"
            element={
              <ProtectedRoutes>
                <MemberDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/member"
            element={
              <ProtectedRoutes>
                <MemberDashboard />
              </ProtectedRoutes>
            }
          />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
