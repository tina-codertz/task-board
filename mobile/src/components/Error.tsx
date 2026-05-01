import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ErrorProps {
  message: string;
}

export default function Error({ message }: ErrorProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="alert-circle" size={48} color="#f44" />
      <Text style={styles.title}>Error</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f44",
    marginTop: 12,
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
