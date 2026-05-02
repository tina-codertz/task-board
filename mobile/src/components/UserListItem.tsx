import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface UserListItemProps {
  id: number;
  name: string;
  email: string;
  role: string;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function UserListItem({
  id,
  name,
  email,
  role,
  onPress,
  onDelete,
}: UserListItemProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "#f44";
      case "MANAGER":
        return "#FF9800";
      default:
        return "#4CAF50";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "shield";
      case "MANAGER":
        return "briefcase";
      default:
        return "account";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="account" size={24} color="#007AFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      <View
        style={[
          styles.roleBadge,
          { backgroundColor: getRoleColor(role) + "20" },
        ]}
      >
        <MaterialCommunityIcons
          name={getRoleIcon(role) as any}
          size={16}
          color={getRoleColor(role)}
        />
        <Text style={[styles.roleText, { color: getRoleColor(role) }]}>
          {role}
        </Text>
      </View>
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <MaterialCommunityIcons name="delete" size={20} color="#f44" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  email: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
});
