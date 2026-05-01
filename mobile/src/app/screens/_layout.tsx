import React from "react";
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="admin" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="manager" options={{ title: "Manager Dashboard" }} />
      <Stack.Screen name="member" options={{ title: "Member Dashboard" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}
