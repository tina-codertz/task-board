import { Redirect } from "expo-router";

export default function HomeScreen() {
  // This is handled by the root _layout.tsx navigation
  return <Redirect href="/auth" />;
}
