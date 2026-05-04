import AsyncStorage from "@react-native-async-storage/async-storage";

// For Expo Go on physical device, use your machine's local IP address
// Find your IP: On Mac, run: ipconfig getifaddr en0
// Replace 192.168.1.6 with your actual local IP address
const API_BASE_URL = "https://task-board-1-hd8l.onrender.com/api" ; // Update this IP to your machine's local IP.this is s alive backend url

// In-memory token storage for immediate access
let memoryToken: string | null = null;
let memoryUser: any | null = null;

// Safe AsyncStorage wrapper with error handling
export const safeAsyncStorage = {
  async setItem(key: string, value: string) {
    try {
      if (AsyncStorage && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      // Silently fail - don't break auth flow
      // AsyncStorage may not be available during development startup
    }
  },
  async getItem(key: string) {
    try {
      if (AsyncStorage && AsyncStorage.getItem) {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      // Return null on error - auth will continue without stored session
      return null;
    }
  },
  async removeItem(key: string) {
    try {
      if (AsyncStorage && AsyncStorage.removeItem) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      // Silently fail - logout will still complete
    }
  },
};

// Login user
export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    // Store token and user data - both in memory and AsyncStorage
    if (data.access_token) {
      // Store in memory for immediate access
      memoryToken = data.access_token;
      memoryUser = data.user;
      
      // Sync to AsyncStorage asynchronously
      safeAsyncStorage.setItem("token", data.access_token);
      safeAsyncStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Register user
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();
    // Store token and user data - both in memory and AsyncStorage
    if (data.access_token) {
      // Store in memory for immediate access
      memoryToken = data.access_token;
      memoryUser = data.user;
      
      // Sync to AsyncStorage asynchronously
      safeAsyncStorage.setItem("token", data.access_token);
      safeAsyncStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// Get current user profile
export async function getUserProfile(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
}

// Logout user
export async function logoutUser() {
  try {
    // Clear memory first
    memoryToken = null;
    memoryUser = null;
    
    // Clear AsyncStorage
    await safeAsyncStorage.removeItem("token");
    await safeAsyncStorage.removeItem("user");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Get token from storage - check memory first for immediate access
export async function getToken() {
  if (memoryToken) {
    return memoryToken;
  }
  const token = await safeAsyncStorage.getItem("token");
  if (token) {
    memoryToken = token;
  }
  return token;
}

// Get user from storage - check memory first for immediate access
export async function getStoredUser() {
  try {
    if (memoryUser) {
      return memoryUser;
    }
    const user = await safeAsyncStorage.getItem("user");
    if (user) {
      memoryUser = JSON.parse(user);
      return memoryUser;
    }
    return null;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
