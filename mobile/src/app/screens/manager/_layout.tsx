import React from "react";
import { Stack } from "expo-router";

export default function ManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "default",
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: "Manager Dashboard" }} />
      <Stack.Screen name="tasks" options={{ title: "Tasks" }} />
      <Stack.Screen name="team" options={{ title: "Team" }} />
      <Stack.Screen name="task-detail" options={{ title: "Task Details" }} />
      <Stack.Screen name="team-detail" options={{ title: "Team Details" }} />
      <Stack.Screen name="create-team" options={{ title: "Create Team" }} />
      <Stack.Screen name="create-task" options={{ title: "Create Task" }} />
      <Stack.Screen name="add-members-to-team" options={{ title: "Add Members" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}
