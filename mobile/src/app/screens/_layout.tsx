import React from "react";
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="admin" options={{ title: "Admin" }} />
      <Stack.Screen name="manager" options={{ title: "Manager" }} />
      <Stack.Screen name="member" options={{ title: "Member" }} />
    </Stack>
  );
}
