import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { taskAPI } from "../_lib/services";

interface TaskListItemWithStatusProps {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: string;
  assignedTo?: any;
  team?: any;
  onStatusChange?: (newStatus: string) => void;
  onDelete?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "TODO":
      return "#9C27B0";
    case "IN_PROGRESS":
      return "#FF9800";
    case "DONE":
      return "#4CAF50";
    default:
      return "#666";
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "HIGH":
      return "#f44";
    case "MEDIUM":
      return "#FF9800";
    case "LOW":
      return "#4CAF50";
    default:
      return "#ddd";
  }
};

export default function TaskListItemWithStatus({
  id,
  title,
  description,
  status,
  priority = "MEDIUM",
  assignedTo,
  team,
  onStatusChange,
  onDelete,
}: TaskListItemWithStatusProps) {
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleStatusChange = async () => {
    if (currentStatus === "DONE") {
      Alert.alert("Already Completed", "This task is already marked as done");
      return;
    }

    const nextStatus = currentStatus === "TODO" ? "IN_PROGRESS" : "DONE";

    try {
      setUpdating(true);
      await taskAPI.updateTaskStatus(id, nextStatus);
      setCurrentStatus(nextStatus);
      onStatusChange?.(nextStatus);
      
      const message = nextStatus === "DONE" ? "Task marked as completed!" : "Task status updated!";
      Alert.alert("Success", message);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "TODO":
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "DONE":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>
        <View style={styles.badgesContainer}>
          <View style={[styles.priorityBadge, { borderColor: getPriorityColor(priority) }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(priority) }]}>
              {priority}
            </Text>
          </View>
          {onDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <MaterialCommunityIcons name="delete" size={20} color="#f44" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.assignmentInfo}>
        {assignedTo ? (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={16} color="#666" />
            <Text style={styles.infoText}>{assignedTo.name}</Text>
          </View>
        ) : team ? (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-multiple" size={16} color="#666" />
            <Text style={styles.infoText}>{team.name}</Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#999" />
            <Text style={styles.infoText}>Not assigned</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) + "20", borderColor: getStatusColor(currentStatus) }]}
        >
          <MaterialCommunityIcons
            name={currentStatus === "DONE" ? "check-circle" : "clock-outline"}
            size={14}
            color={getStatusColor(currentStatus)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(currentStatus) }]}>
            {getStatusLabel(currentStatus)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleStatusChange}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#FF9800" />
          ) : (
            <>
              <MaterialCommunityIcons
                name={currentStatus === "DONE" ? "restart" : "check"}
                size={16}
                color="#FF9800"
              />
              <Text style={styles.updateButtonText}>
                {currentStatus === "DONE" ? "Reset" : "Complete"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 8,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: "#666",
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 8,
    padding: 2,
  },
  assignmentInfo: {
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  updateButton: {
    flexDirection: "row",
    backgroundColor: "#fff9e6",
    borderWidth: 1,
    borderColor: "#FF9800",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    gap: 4,
  },
  updateButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF9800",
  },
});
