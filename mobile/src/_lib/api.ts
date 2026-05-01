import AsyncStorage from "@react-native-async-storage/async-storage";

// For Expo Go on physical device, use your machine's local IP address
// Find your IP: On Mac, run: ipconfig getifaddr en0
// Replace 192.168.1.6 with your actual local IP address
const API_BASE_URL = "http://192.168.1.6:8000/api"; // Update this IP to your machine's local IP

// Safe AsyncStorage wrapper with error handling
const safeAsyncStorage = {
  async setItem(key: string, value: string) {
    try {
      if (AsyncStorage && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn(`Failed to save ${key} to AsyncStorage:`, error);
      // Silently fail - don't break auth flow
    }
  },
  async getItem(key: string) {
    try {
      if (AsyncStorage && AsyncStorage.getItem) {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.warn(`Failed to get ${key} from AsyncStorage:`, error);
      return null;
    }
  },
  async removeItem(key: string) {
    try {
      if (AsyncStorage && AsyncStorage.removeItem) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Failed to remove ${key} from AsyncStorage:`, error);
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
    // Store token and user data
    if (data.access_token) {
      await safeAsyncStorage.setItem("token", data.access_token);
      await safeAsyncStorage.setItem("user", JSON.stringify(data.user));
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
    // Store token and user data
    if (data.access_token) {
      await safeAsyncStorage.setItem("token", data.access_token);
      await safeAsyncStorage.setItem("user", JSON.stringify(data.user));
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
    await safeAsyncStorage.removeItem("token");
    await safeAsyncStorage.removeItem("user");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Get token from storage
export async function getToken() {
  return await safeAsyncStorage.getItem("token");
}

// Get user from storage
export async function getStoredUser() {
  try {
    const user = await safeAsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
