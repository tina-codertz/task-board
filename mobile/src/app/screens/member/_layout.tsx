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
    </Stack>
  );
}
