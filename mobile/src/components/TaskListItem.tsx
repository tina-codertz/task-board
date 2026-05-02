import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface TaskListItemProps {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  dueDate?: string;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function TaskListItem({
  id,
  title,
  description,
  status,
  priority = "MEDIUM",
  assignee,
  dueDate,
  onPress,
  onDelete,
}: TaskListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#4CAF50";
      case "IN_PROGRESS":
        return "#007AFF";
      case "TODO":
        return "#999";
      default:
        return "#999";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "#f44";
      case "MEDIUM":
        return "#FF9800";
      default:
        return "#4CAF50";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.leftBorder,
          { backgroundColor: getStatusColor(status) },
        ]}
      />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.badgesContainer}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(priority) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(priority) },
                ]}
              >
                {priority}
              </Text>
            </View>
            {onDelete && (
              <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                <MaterialCommunityIcons name="delete" size={18} color="#f44" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
        <View style={styles.footer}>
          {assignee && (
            <View style={styles.footerItem}>
              <MaterialCommunityIcons
                name="account"
                size={12}
                color="#999"
              />
              <Text style={styles.footerText}>{assignee}</Text>
            </View>
          )}
          {dueDate && (
            <View style={styles.footerItem}>
              <MaterialCommunityIcons
                name="calendar"
                size={12}
                color="#999"
              />
              <Text style={styles.footerText}>{dueDate}</Text>
            </View>
          )}
          <View style={styles.footerItem}>
            <MaterialCommunityIcons
              name="circle"
              size={12}
              color={getStatusColor(status)}
            />
            <Text style={styles.footerText}>{status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  leftBorder: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: "#999",
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 8,
    padding: 2,
  },
});
