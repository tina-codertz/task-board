import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "../../_context/AuthContext";

export default function ScreensLayout() {
  const { user } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {user?.role === "ADMIN" && (
        <Stack.Screen name="admin" options={{ title: "Admin Dashboard" }} />
      )}
      {user?.role === "MANAGER" && (
        <Stack.Screen name="manager" options={{ title: "Manager Dashboard" }} />
      )}
      {user?.role === "USER" && (
        <Stack.Screen name="member" options={{ title: "Member Dashboard" }} />
      )}
    </Stack>
  );
}
