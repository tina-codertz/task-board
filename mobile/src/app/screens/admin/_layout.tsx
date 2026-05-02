import React from "react";
import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "default",
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="create-user" options={{ title: "Create User" }} />
      <Stack.Screen name="manage-users" options={{ title: "Manage Users" }} />
      <Stack.Screen name="activity-logs" options={{ title: "Activity Logs" }} />
      <Stack.Screen name="view-tasks" options={{ title: "View Tasks" }} />
      <Stack.Screen name="view-team" options={{ title: "View Teams" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}
