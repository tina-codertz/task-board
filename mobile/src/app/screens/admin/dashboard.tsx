import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../_context/AuthContext";
import { adminAPI, taskAPI, teamAPI } from "../../../_lib/services";
import StatCard from "../../../components/StatCard";
import BottomTabBar from "../../../components/BottomTabBar";
import UserListItem from "../../../components/UserListItem";
import TaskListItem from "../../../components/TaskListItem";
import Loading from "../../../components/Loading";
import Error from "../../../components/Error";
import EmptyState from "../../../components/EmptyState";
import DashboardHeader from "../../../components/DashboardHeader";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Stats {
  totalUsers: number;
  admins: number;
  managers: number;
  users: number;
  totalTasks: number;
  totalTeams: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt?: string;
}

interface Team {
  id: number;
  name: string;
  description?: string;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    admins: 0,
    managers: 0,
    users: 0,
    totalTasks: 0,
    totalTeams: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "users", label: "Users", icon: "account-multiple" },
    { id: "tasks", label: "Tasks", icon: "checkbox-multiple-marked" },
    { id: "teams", label: "Teams", icon: "account-multiple" },
  ];

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch all data in parallel
      const [usersData, tasksData, teamsData] = await Promise.all([
        adminAPI.getAllUsers(),
        taskAPI.getAllTasks(),
        teamAPI.getAllTeams(),
      ]);

      const usersList = usersData.users || [];
      const tasksList = tasksData.tasks || [];
      const teamsList = teamsData.teams || [];

      // Calculate stats
      setStats({
        totalUsers: usersList.length,
        admins: usersList.filter((u: User) => u.role === "ADMIN").length,
        managers: usersList.filter((u: User) => u.role === "MANAGER").length,
        users: usersList.filter((u: User) => u.role === "USER").length,
        totalTasks: tasksList.length,
        totalTeams: teamsList.length,
      });

      setUsers(usersList);
      setTasks(tasksList);
      setTeams(teamsList);
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

  const handleDeleteUser = (id: number, name: string) => {
    Alert.alert("Delete User", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await adminAPI.deleteUser(id);
            fetchData();
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete user");
          }
        },
      },
    ]);
  };

  const handleDeleteTask = (id: number, title: string) => {
    Alert.alert("Delete Task", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await taskAPI.deleteTask(id);
            fetchData();
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete task");
          }
        },
      },
    ]);
  };

  const handleDeleteTeam = (id: number, name: string) => {
    Alert.alert("Delete Team", `Are you sure you want to delete team "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await teamAPI.deleteTeam(id);
            fetchData();
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete team");
          }
        },
      },
    ]);
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
        title="Administrator"
        backgroundColor="#007AFF"
        role="ADMIN"
      />

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/screens/admin/create-user")}
        >
          <MaterialCommunityIcons name="account-plus" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Create User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/screens/admin/activity-logs")}
        >
          <MaterialCommunityIcons name="history" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Activity Logs</Text>
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
            <Text style={styles.sectionTitle}>Dashboard Stats</Text>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="account-multiple"
              color="#007AFF"
            />
            <StatCard
              title="Administrators"
              value={stats.admins}
              icon="shield"
              color="#f44"
            />
            <StatCard
              title="Managers"
              value={stats.managers}
              icon="briefcase"
              color="#FF9800"
            />
            <StatCard
              title="Members"
              value={stats.users}
              icon="account-multiple-outline"
              color="#4CAF50"
            />
            <StatCard
              title="Total Tasks"
              value={stats.totalTasks}
              icon="checkbox-multiple-marked"
              color="#9C27B0"
            />
            <StatCard
              title="Total Teams"
              value={stats.totalTeams}
              icon="briefcase-multiple"
              color="#00BCD4"
            />
          </View>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Users</Text>
            {users.length > 0 ? (
              users.map((user) => (
                <UserListItem
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  email={user.email}
                  role={user.role}
                  onDelete={() => handleDeleteUser(user.id, user.name)}
                />
              ))
            ) : (
              <EmptyState
                icon="account-multiple"
                title="No Users"
                message="There are no users in the system"
              />
            )}
          </View>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Tasks</Text>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  status={task.status}
                  priority={task.priority}
                  onDelete={() => handleDeleteTask(task.id, task.title)}
                />
              ))
            ) : (
              <EmptyState
                icon="checkbox-multiple-outline"
                title="No Tasks"
                message="There are no tasks in the system"
              />
            )}
          </View>
        )}

        {/* Teams Tab */}
        {activeTab === "teams" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Teams</Text>
            {teams.length > 0 ? (
              teams.map((team) => (
                <View key={team.id} style={styles.teamCard}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  {team.description && (
                    <Text style={styles.teamDescription}>
                      {team.description}
                    </Text>
                  )}
                  <View style={styles.teamStatsContainer}>
                    <View style={styles.teamStats}>
                      <View style={styles.statItem}>
                        <MaterialCommunityIcons 
                          name="account-multiple" 
                          size={14} 
                          color="#666" 
                        />
                        <Text style={styles.statText}>
                          {team.members?.length || 0} Members
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <MaterialCommunityIcons 
                          name="checkbox-multiple-marked" 
                          size={14} 
                          color="#666" 
                        />
                        <Text style={styles.statText}>
                          {team.tasks?.length || 0} Tasks
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTeam(team.id, team.name)}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#f44" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                icon="briefcase-multiple"
                title="No Teams"
                message="There are no teams in the system"
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
        color="#007AFF"
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
    backgroundColor: "#007AFF",
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
    backgroundColor: "#007AFF",
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
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  teamDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  teamStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  teamStats: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  deleteButton: {
    padding: 4,
  },
});
