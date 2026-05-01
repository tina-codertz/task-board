import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../../_context/AuthContext";

export default function AuthPage() {
  const { login, register, isLoading, error } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleLogin() {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLocalError("Email and password are required");
      return;
    }

    try {
      setLocalError(null);
      await login(loginEmail, loginPassword);
      // Navigation happens automatically based on user role
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setLocalError(errorMsg);
      Alert.alert("Login Failed", errorMsg);
    }
  }

  async function handleRegister() {
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setLocalError("All fields are required");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    // Password validation: uppercase, lowercase, number, special char, min 8 chars
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/;
    if (registerPassword.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }

    if (!passwordRegex.test(registerPassword)) {
      setLocalError(
        "Password must include uppercase, lowercase, number, and special character"
      );
      return;
    }

    // Name validation
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (registerName.length < 3 || registerName.length > 50) {
      setLocalError("Name must be between 3 and 50 characters");
      return;
    }

    if (!nameRegex.test(registerName)) {
      setLocalError("Name can only contain letters, spaces, hyphens, and apostrophes");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    try {
      setLocalError(null);
      await register(registerName, registerEmail, registerPassword);
      // Navigation happens automatically based on user role
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed";
      setLocalError(errorMsg);
      Alert.alert("Registration Failed", errorMsg);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Task Board</Text>
          <Text style={styles.subtitle}>
            {isLoginMode ? "Login to your account" : "Create your account"}
          </Text>

          {/* Tab Toggle */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                isLoginMode && styles.tabActive,
              ]}
              onPress={() => {
                setIsLoginMode(true);
                setLocalError(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  isLoginMode && styles.tabTextActive,
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                !isLoginMode && styles.tabActive,
              ]}
              onPress={() => {
                setIsLoginMode(false);
                setLocalError(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  !isLoginMode && styles.tabTextActive,
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {(error || localError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error || localError}</Text>
            </View>
          )}

          {/* Login Form */}
          {isLoginMode ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  editable={!isLoading}
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry
                  editable={!isLoading}
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            // Register Form
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={registerName}
                  onChangeText={setRegisterName}
                  editable={!isLoading}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChangeText={setRegisterEmail}
                  editable={!isLoading}
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <Text style={styles.hint}>
                  Min 8 chars: uppercase, lowercase, number, special char
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={registerPassword}
                  onChangeText={setRegisterPassword}
                  secureTextEntry
                  editable={!isLoading}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
  },
  errorContainer: {
    backgroundColor: "#fee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#f44",
  },
  errorText: {
    color: "#c00",
    fontSize: 14,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#000",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
