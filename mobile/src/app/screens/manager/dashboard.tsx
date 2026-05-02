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
import TaskListItemWithStatus from "../../../components/TaskListItemWithStatus";
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
  myTeams: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: string;
  assignedTo?: any;
  team?: any;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  members?: any[];
  tasks?: any[];
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
    myTeams: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "tasks", label: "My Tasks", icon: "checkbox-multiple-marked" },
    { id: "team", label: "My Team", icon: "account-multiple" },
  ];

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch manager's created tasks and teams in parallel
      const [tasksData, teamsData] = await Promise.all([
        taskAPI.getCreatedTasks(),
        teamAPI.getMyTeams(),
      ]);
      
      const tasksList = tasksData.tasks || [];
      const teamsList = Array.isArray(teamsData) ? teamsData : (teamsData.teams || []);

      // Calculate stats
      const completedCount = tasksList.filter((t: Task) => t.status === "DONE").length;
      const inProgressCount = tasksList.filter((t: Task) => t.status === "IN_PROGRESS").length;
      
      // Count total team members across all teams
      const totalMembers = teamsList.reduce((sum: number, team: Team) => {
        return sum + (team.members?.length || 0);
      }, 0);

      setStats({
        myTasks: tasksList.length,
        completedTasks: completedCount,
        inProgressTasks: inProgressCount,
        teamMembers: totalMembers,
        myTeams: teamsList.length,
      });

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
                <TouchableOpacity
                  key={task.id}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/manager/task-detail",
                      params: { taskId: task.id.toString() },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <TaskListItemWithStatus
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority || "MEDIUM"}
                    assignedTo={task.assignedTo}
                    team={task.team}
                    onStatusChange={() => {
                      // Refresh the task list after status change
                      fetchData();
                    }}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState
                icon="checkbox-multiple-outline"
                title="No Tasks"
                message="You haven't created any tasks yet"
              />
            )}
          </View>
        )}

        {/* Teams Tab */}
        {activeTab === "team" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Teams</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("/screens/manager/create-team")}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
            {teams.length > 0 ? (
              teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.teamCard}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/manager/team-detail",
                      params: {
                        teamId: team.id.toString(),
                        teamName: team.name,
                      },
                    })
                  }
                >
                  <View style={styles.teamCardHeader}>
                    <View style={styles.teamCardInfo}>
                      <Text style={styles.teamName}>{team.name}</Text>
                      {team.description && (
                        <Text style={styles.teamDescription} numberOfLines={1}>
                          {team.description}
                        </Text>
                      )}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#FF9800" />
                  </View>
                  <View style={styles.teamStats}>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons 
                        name="account-multiple" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.statText}>
                        {team.members?.length || 0} Members
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons 
                        name="checkbox-multiple-marked" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.statText}>
                        {team.tasks?.length || 0} Tasks
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState
                icon="account-multiple"
                title="No Teams"
                message="You haven't created any teams yet"
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#FF9800",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    gap: 4,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  teamCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  teamCardInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 0,
  },
  teamStats: {
    flexDirection: "row",
    gap: 16,
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
});
