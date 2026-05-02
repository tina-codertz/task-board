import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { adminAPI } from "../../../_lib/services";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Loading from "../../../components/Loading";
import Error from "../../../components/Error";
import EmptyState from "../../../components/EmptyState";

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  userId: number;
  metadata: any;
  createdAt: string;
}

export default function ActivityLogsScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setError(null);
      const response = await adminAPI.getActivityLogs();
      const logsList = (Array.isArray(response) ? response : response?.logs || response?.data || []);
      setLogs(Array.isArray(logsList) ? logsList : []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN")) return "login";
    if (action.includes("REGISTER")) return "account-plus";
    if (action.includes("TASK")) return "check-circle";
    if (action.includes("TEAM")) return "account-group";
    if (action.includes("USER")) return "account";
    return "information";
  };

  const getActionColor = (action: string) => {
    if (action.includes("FAILED")) return "#f44";
    if (action.includes("SUCCESS")) return "#4CAF50";
    if (action.includes("LOGIN")) return "#2196F3";
    if (action.includes("REGISTER")) return "#FF9800";
    return "#007AFF";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return <Loading message="Loading Activity Logs..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Activity Logs</Text>
          <View style={{ width: 24 }} />
        </View>
        <Error message={error} />
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Activity Logs</Text>
          <View style={{ width: 24 }} />
        </View>
        <EmptyState
          icon="history"
          title="No Activity Logs"
          message="No activity has been recorded yet"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Activity Logs</Text>
        <TouchableOpacity onPress={onRefresh}>
          <MaterialCommunityIcons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.logsList}>
          {logs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getActionColor(log.action || "") + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name={getActionIcon(log.action || "")}
                  size={20}
                  color={getActionColor(log.action || "")}
                />
              </View>

              <View style={styles.logContent}>
                <Text style={styles.logAction}>{log.action || "Unknown"}</Text>
                <Text style={styles.logDescription}>{log.description || "No description"}</Text>
                <Text style={styles.logTime}>{log.createdAt ? formatDate(log.createdAt) : "Unknown time"}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  logsList: {
    gap: 12,
  },
  logItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    alignItems: "flex-start",
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  logDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  logTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
