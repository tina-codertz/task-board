import AsyncStorage from "@react-native-async-storage/async-storage";

// For Expo Go on physical device, use your machine's local IP address
// Find your IP: On Mac, run: ipconfig getifaddr en0
// Replace 192.168.1.6 with your actual local IP address
const API_BASE_URL = "http://192.168.1.6:8000/api"; // Update this IP to your machine's local IP

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
      await AsyncStorage.setItem("token", data.access_token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
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
      await AsyncStorage.setItem("token", data.access_token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
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
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  } catch (error) {
    // Gracefully handle AsyncStorage errors during logout
    if (error instanceof Error && error.message.includes("Native module")) {
      console.warn("AsyncStorage not ready during logout");
      return;
    }
    console.error("Logout error:", error);
    throw error;
  }
}

// Get token from storage
export async function getToken() {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    if (error instanceof Error && error.message.includes("Native module")) {
      // AsyncStorage not ready on initial load - this is expected
      return null;
    }
    console.error("Get token error:", error);
    return null;
  }
}

// Get user from storage
export async function getStoredUser() {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Native module")) {
      // AsyncStorage not ready on initial load - this is expected
      return null;
    }
    console.error("Get user error:", error);
    return null;
  }
}
