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
  todoTasks: number;
  myTeams: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: string;
  dueDate?: string;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  members?: any[];
  tasks?: any[];
}

export default function MemberDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats>({
    myTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    myTeams: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "tasks", label: "My Tasks", icon: "checkbox-multiple-marked" },
    { id: "teams", label: "My Teams", icon: "account-multiple" },
  ];

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch member's assigned tasks and teams in parallel
      const [tasksData, teamsData] = await Promise.all([
        taskAPI.getAssignedTasks(),
        teamAPI.getMyTeams(),
      ]);
      
      const tasksList = tasksData.tasks || [];
      const teamsList = Array.isArray(teamsData) ? teamsData : (teamsData.teams || []);

      // Calculate stats
      setStats({
        myTasks: tasksList.length,
        completedTasks: tasksList.filter((t: Task) => t.status === "DONE").length,
        inProgressTasks: tasksList.filter((t: Task) => t.status === "IN_PROGRESS").length,
        todoTasks: tasksList.filter((t: Task) => t.status === "TODO").length,
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
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Your Teams</Text>
            <StatCard
              title="Total Teams"
              value={stats.myTeams}
              icon="account-multiple"
              color="#00BCD4"
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
                  priority={task.priority || "MEDIUM"}
                  dueDate={task.dueDate}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/member/task-detail",
                      params: { taskId: task.id.toString() },
                    })
                  }
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

        {/* Teams Tab */}
        {activeTab === "teams" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Teams</Text>
            {teams.length > 0 ? (
              teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/member/team-detail",
                      params: {
                        teamId: team.id.toString(),
                        teamName: team.name,
                      },
                    })
                  }
                  style={styles.teamCardTouchable}
                >
                  <View style={styles.teamCard}>
                    <View style={styles.teamCardContent}>
                      <Text style={styles.teamName}>{team.name}</Text>
                      {team.description && (
                        <Text style={styles.teamDescription} numberOfLines={1}>
                          {team.description}
                        </Text>
                      )}
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
                    </View>
                    <MaterialCommunityIcons 
                      name="chevron-right" 
                      size={24} 
                      color="#4CAF50" 
                    />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState
                icon="account-multiple"
                title="No Teams"
                message="You are not part of any teams yet"
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
  teamCardTouchable: {
    marginBottom: 12,
  },
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  teamCardContent: {
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
    marginBottom: 12,
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
