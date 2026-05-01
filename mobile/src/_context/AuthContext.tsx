import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  logoutUser as apiLogout,
  getToken,
  getStoredUser,
} from "../_lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MANAGER" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on app load
  useEffect(() => {
    // Add delay to allow native modules to initialize
    // AsyncStorage needs time to set up before first access
    const timer = setTimeout(() => {
      initializeAuth();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  async function initializeAuth() {
    try {
      const token = await getToken();
      if (token) {
        const storedUser = await getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }
    } catch (err) {
      console.error("Auth initialization error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiLogin(email, password);
      setUser(response.user);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiRegister(name, email, password);
      setUser(response.user);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setError(null);
      await apiLogout();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      throw err;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
