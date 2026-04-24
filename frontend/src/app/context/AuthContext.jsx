import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Load user on app start (verify token)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Invalid token");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Auth check failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  //  Save user + token
  const saveAuth = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
  };

  const authRequest = async (endpoint, payload, errorLabel) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) return false;

      const data = await res.json();
      saveAuth(data.user, data.access_token);

      return true;
    } catch (err) {
      console.error(`${errorLabel}:`, err);
      return false;
    }
  };

  // 🔹 Login

  const login = async (email, password) => {
    return authRequest(
      "/auth/login",
      { email, password },
      "Login error"
    );
  };

  // 🔹 Register
  const register = async (name, email, password) => {
    return authRequest(
      "/auth/register",
      { name, email, password },
      "Register error"
    );
  };

  //  Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  //  Verify email 
  const verifyEmail = async (code) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      setUser(data.user);

      return true;
    } catch (err) {
      console.error("Verification error:", err);
      return false;
    }
  };

  //  Switch role
  const switchRole = async (role) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/auth/switch-role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      setUser(data.user);

      return true;
    } catch (err) {
      console.error("Role switch error:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        verifyEmail,
        switchRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}