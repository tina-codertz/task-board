import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../_context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DashboardHeaderProps {
  title: string;
  backgroundColor: string;
  role: string;
}

export default function DashboardHeader({
  title,
  backgroundColor,
  role,
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleProfilePress = () => {
    if (role === "MANAGER") {
      router.push("/screens/manager/profile");
    } else if (role === "ADMIN") {
      router.push("/screens/admin/profile");
    } else {
      router.push("/screens/member/profile");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            setLoggingOut(true);
            await logout();
            router.replace("/auth");
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
            setLoggingOut(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.titleContainer}>
        <Text style={styles.greeting}>Welcome, {user?.name}</Text>
        <Text style={styles.role}>{title}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
          disabled={loggingOut}
        >
          <MaterialCommunityIcons name="account" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  role: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  profileButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
