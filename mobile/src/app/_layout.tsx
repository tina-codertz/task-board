import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../_context/AuthContext";

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated) {
      // User is not authenticated, redirect to auth group
      if (!inAuthGroup) {
        router.replace("/auth");
      }
    } else {
      // User is authenticated, route based on role
      if (inAuthGroup) {
        // User is authenticated but in auth group, redirect to appropriate dashboard
        if (user?.role === "ADMIN") {
          router.replace("/screens/admin/dashboard");
        } else if (user?.role === "MANAGER") {
          router.replace("/screens/manager/dashboard");
        } else {
          // USER role
          router.replace("/screens/member/dashboard");
        }
      }
    }
  }, [isAuthenticated, isLoading, user?.role, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
