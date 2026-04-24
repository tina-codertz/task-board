import React from "react";
import { AuthProvider } from "./app/context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import Header from "./app/components/layout/Header";
import AuthPage from "./app/pages/auth/AuthPage";
import ProtectedRoutes from "./app/routes/ProtectedRoutes";
import AdminDashboard from "./app/pages/dashboards/AdminDashboard";
import ManagerDashboard from "./app/pages/dashboards/ManagerDashboard";
import MemberDashboard from "./app/pages/dashboards/MemberDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />

        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          {/* protected routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoutes>
                <AdminDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoutes>
                <ManagerDashboard />
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
          <Route
            path="/member"
            element={
              <ProtectedRoutes>
                <MemberDashboard />
              </ProtectedRoutes>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
