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
import { useAuth } from "../../../_context/AuthContext";
import { taskAPI, teamAPI } from "../../../_lib/services";
import StatCard from "../../../components/StatCard";
import BottomTabBar from "../../../components/BottomTabBar";
import TaskListItem from "../../../components/TaskListItem";
import Loading from "../../../components/Loading";
import Error from "../../../components/Error";
import EmptyState from "../../../components/EmptyState";
import DashboardHeader from "../../../components/DashboardHeader";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Stats {
  myTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  teamMembers: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
}

export default function ManagerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats>({
    myTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "tasks", label: "My Tasks", icon: "checkbox-multiple-marked" },
    { id: "team", label: "My Team", icon: "people" },
  ];

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch manager's tasks
      const tasksData = await taskAPI.getAssignedTasks();
      const tasksList = tasksData.tasks || [];

      // Calculate stats
      setStats({
        myTasks: tasksList.length,
        completedTasks: tasksList.filter((t: Task) => t.status === "COMPLETED").length,
        inProgressTasks: tasksList.filter((t: Task) => t.status === "IN_PROGRESS").length,
        teamMembers: 0, // Will be populated from team endpoint
      });

      setTasks(tasksList);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading message="Loading Dashboard..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Error message={error} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Logout */}
      <DashboardHeader
        title="Manager"
        backgroundColor="#FF9800"
        role="MANAGER"
      />

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/screens/manager/create-task")}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Create Task</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/screens/manager/create-team")}
        >
          <MaterialCommunityIcons name="account-multiple-plus" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Create Team</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task Overview</Text>
            <StatCard
              title="My Tasks"
              value={stats.myTasks}
              icon="checkbox-multiple-outline"
              color="#007AFF"
            />
            <StatCard
              title="Completed"
              value={stats.completedTasks}
              icon="checkbox-marked-circle"
              color="#4CAF50"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgressTasks}
              icon="progress-clock"
              color="#FF9800"
            />
            <StatCard
              title="Team Members"
              value={stats.teamMembers}
              icon="account-multiple"
              color="#9C27B0"
            />
          </View>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Tasks</Text>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  status={task.status}
                  priority={task.priority}
                />
              ))
            ) : (
              <EmptyState
                icon="checkbox-multiple-outline"
                title="No Tasks"
                message="You don't have any tasks assigned"
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        color="#FF9800"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  role: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FF9800",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
});
