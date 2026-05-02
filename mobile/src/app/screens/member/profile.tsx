import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../_context/AuthContext";
import { authAPI } from "../../../_lib/services";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function MemberProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getProfile();
      setProfile(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return false;
    }
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        Alert.alert("Error", "Current password is required to change password");
        return false;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert("Error", "New passwords do not match");
        return false;
      }
      if (newPassword.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters");
        return false;
      }
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
      };

      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const result = await authAPI.updateProfile(updateData);
      setProfile(result.user);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="account" size={60} color="#fff" />
          </View>
          <Text style={styles.roleBadge}>{profile?.role}</Text>
        </View>

        {/* Profile Info */}
        {!editing ? (
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{profile?.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile?.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{profile?.role}</Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color="#4CAF50"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  editable={!saving}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color="#4CAF50"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!saving}
                />
              </View>
            </View>

            {/* Password Section */}
            <View style={styles.passwordSection}>
              <Text style={styles.sectionTitle}>Change Password (Optional)</Text>

              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="lock"
                    size={20}
                    color="#4CAF50"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showPasswords}
                    editable={!saving}
                  />
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="lock"
                    size={20}
                    color="#4CAF50"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPasswords}
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="lock"
                    size={20}
                    color="#4CAF50"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPasswords}
                    editable={!saving}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPasswords(!showPasswords)}
                    style={styles.eyeIcon}
                  >
                    <MaterialCommunityIcons
                      name={showPasswords ? "eye-off" : "eye"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditing(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={18} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={saving}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#f44" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 12,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  roleBadge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 12,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    padding: 8,
  },
  passwordSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f44",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f44",
  },
});
