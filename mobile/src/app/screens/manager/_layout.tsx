import React from "react";
import { Stack } from "expo-router";

export default function ManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: "Manager Dashboard" }} />
      <Stack.Screen name="tasks" options={{ title: "Tasks" }} />
      <Stack.Screen name="team" options={{ title: "Team" }} />
    </Stack>
  );
}
