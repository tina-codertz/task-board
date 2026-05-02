import React from "react";
import { Stack } from "expo-router";

export default function MemberLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="task-detail" options={{ title: "Task Details" }} />
      <Stack.Screen name="team-detail" options={{ title: "Team Details" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}
