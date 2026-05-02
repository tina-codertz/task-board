import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../../_context/AuthContext";
import { taskAPI } from "../../../_lib/services";
import StatCard from "../../../components/StatCard";
import BottomTabBar from "../../../components/BottomTabBar";
import TaskListItem from "../../../components/TaskListItem";
import Loading from "../../../components/Loading";
import Error from "../../../components/Error";
import EmptyState from "../../../components/EmptyState";
import DashboardHeader from "../../../components/DashboardHeader";

interface Stats {
  myTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
}

export default function MemberDashboardScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats>({
    myTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "tasks", label: "My Tasks", icon: "checkbox-multiple-marked" },
  ];

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch member's assigned tasks
      const tasksData = await taskAPI.getAssignedTasks();
      const tasksList = tasksData.tasks || [];

      // Calculate stats
      setStats({
        myTasks: tasksList.length,
        completedTasks: tasksList.filter((t: Task) => t.status === "COMPLETED").length,
        inProgressTasks: tasksList.filter((t: Task) => t.status === "IN_PROGRESS").length,
        todoTasks: tasksList.filter((t: Task) => t.status === "TODO").length,
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
        title="Member"
        backgroundColor="#4CAF50"
        role="USER"
      />

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
            <Text style={styles.sectionTitle}>Your Tasks</Text>
            <StatCard
              title="Total Tasks"
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
              title="To Do"
              value={stats.todoTasks}
              icon="clipboard-list-outline"
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
                  dueDate={task.dueDate}
                />
              ))
            ) : (
              <EmptyState
                icon="checkbox-multiple-outline"
                title="No Tasks"
                message="You don't have any tasks assigned yet"
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
        color="#4CAF50"
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
    backgroundColor: "#4CAF50",
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
