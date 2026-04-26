import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  Users,
  Shield,
  Briefcase,
  UserCheck,
  Activity,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Calendar,
  Trash2,
  Plus,
  MoreVertical,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminAPI, activityLogAPI, taskAPI, teamAPI } from "../../lib/api";

import StatsGrid from "../../components/admin/StatsGrid";
import TabNav from "../../components/admin/TabNav";
import UsersTable from "../../components/admin/UserTable";
import AddUserForm from "../../components/admin/AddUserForm";
import ActivityLogsTable from "../..//components/admin/ActivityLogs";
import {
  EditRoleModal,
  DeleteConfirmModal,
} from "../../components/admin/Modals";
import { ErrorAlert, SuccessAlert } from "../../components/admin/Alerts";
import Header from "../../components/layout/Header";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    managers: 0,
    members: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers();
      const list = data.users || [];
      setUsers(list);
      setStats({
        totalUsers: list.length,
        admins: list.filter((u) => u.role === "ADMIN").length,
        managers: list.filter((u) => u.role === "MANAGER").length,
        members: list.filter((u) => u.role === "USER").length,
      });
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await activityLogAPI.getAllLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await taskAPI.getAllTasks();
      setTasks(data.tasks || []);
    } catch {
      setError("Failed to fetch tasks");
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await teamAPI.getAllTeams();
      setTeams(data.teams || []);
    } catch {
      setError("Failed to fetch teams");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "logs") fetchLogs();
    if (activeTab === "tasks") fetchTasks();
    if (activeTab === "teams") fetchTeams();
  }, [activeTab]);

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRoleChange = async () => {
    if (!editingUser || !newRole) return;
    try {
      await adminAPI.updateUserRole(editingUser.id, newRole);
      flash("User role updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch {
      setError("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      flash("User deleted successfully");
      setDeleteConfirm(null);
      fetchUsers();
    } catch {
      setError("Failed to delete user");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskAPI.deleteTask(taskId);
      flash("Task deleted successfully");
      fetchTasks();
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      await teamAPI.deleteTeam(teamId);
      flash("Team deleted successfully");
      fetchTeams();
    } catch (err) {
      setError(err.message || "Failed to delete team");
    }
  };

  const handleAddUser = async (form) => {
    try {
      setLoading(true);
      await adminAPI.createUser(
        form.name,
        form.email,
        form.password,
        form.role,
      );
      flash("User created successfully");
      fetchUsers();
      setTimeout(() => setActiveTab("users"), 2000);
      return true;
    } catch (err) {
      setError(err.message || "Failed to create user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (loading && activeTab === "users") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header Component */}
      <Header title="Admin Dashboard" userName={user?.name} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} onClose={() => setError("")} />
        <SuccessAlert message={success} onClose={() => setSuccess("")} />

        {/* Welcome Banner with Stats */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/20 p-1 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-blue-100 text-xs font-medium">
                  Admin Access
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-1">
                Welcome back, {user?.name?.split(" ")[0]}! 
              </h2>
              <p className="text-blue-100 text-sm">
                Monitor system activity, manage users, and control platform
                settings.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-xs text-blue-100">Total Users</div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Enhanced for users tab */}
        {activeTab === "users" && (
          <div className="mb-8">
            <StatsGrid stats={stats} />
          </div>
        )}

        {/* Quick Stats Row for other tabs */}
        {activeTab !== "users" && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickStatCard
              icon={BarChart3}
              label="Total Tasks"
              value={tasks.length}
              color="blue"
            />
            <QuickStatCard
              icon={CheckCircle}
              label="Completion Rate"
              value={`${completionRate}%`}
              color="green"
            />
            <QuickStatCard
              icon={Users}
              label="Active Teams"
              value={teams.length}
              color="purple"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "users" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    System Users
                  </h2>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {users.length} total
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("add-user")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm rounded-lg transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
              <UsersTable
                users={users}
                currentUserId={user?.id}
                onEditRole={(u) => {
                  setEditingUser(u);
                  setNewRole(u.role);
                }}
                onDeleteConfirm={setDeleteConfirm}
              />
            </div>
          )}

          {activeTab === "add-user" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900">
                  Create New User Account
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Fill in the details to add a new user to the system
                </p>
              </div>
              <div className="p-6">
                <AddUserForm
                  onSubmit={handleAddUser}
                  onCancel={() => setActiveTab("users")}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Activity Logs
                  </h2>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    Real-time monitoring
                  </span>
                </div>
              </div>
              <ActivityLogsTable logs={logs} />
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Task Management
                    </h2>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">
                        Completed: {completedTasks}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-600">
                        In Progress:{" "}
                        {tasks.filter((t) => t.status === "IN_PROGRESS").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {[
                        "Task",
                        "Team",
                        "Assigned To",
                        "Status",
                        "Created",
                        "Actions",
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks && tasks.length > 0 ? (
                      tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {task.team?.name || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {task.assignedTo?.name
                                  ?.charAt(0)
                                  .toUpperCase() || "?"}
                              </div>
                              <span className="text-sm text-gray-600">
                                {task.assignedTo?.name || "Unassigned"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={task.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {task.createdAt
                                ? new Date(task.createdAt).toLocaleDateString()
                                : "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-800 transition p-1 hover:bg-red-50 rounded"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <BarChart3 className="w-16 h-16 text-gray-300" />
                            <p className="text-gray-500 font-medium">
                              No tasks found
                            </p>
                            <p className="text-sm text-gray-400">
                              Tasks created by managers will appear here
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "teams" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Team Directory
                  </h2>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {teams.length} teams
                  </span>
                </div>
              </div>

              {teams && teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      onDelete={handleDeleteTeam}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="w-16 h-16 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">
                      No teams found
                    </h3>
                    <p className="text-sm text-gray-500">
                      Teams will appear here once created by managers
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {editingUser && (
        <EditRoleModal
          user={editingUser}
          role={newRole}
          onRoleChange={setNewRole}
          onConfirm={handleRoleChange}
          onCancel={() => setEditingUser(null)}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => handleDeleteUser(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

// Quick Stat Card Component
const QuickStatCard = ({ icon: Icon, label, value, color }) => {
  const gradients = {
    blue: "from-blue-50 to-indigo-50 border-blue-100",
    green: "from-green-50 to-emerald-50 border-green-100",
    purple: "from-purple-50 to-pink-50 border-purple-100",
  };

  const iconGradients = {
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
  };

  return (
    <div
      className={`bg-gradient-to-br ${gradients[color]} rounded-xl p-4 border shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div
          className={`bg-gradient-to-br ${iconGradients[color]} p-2 rounded-lg`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    DONE: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Completed",
      icon: CheckCircle,
    },
    IN_PROGRESS: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "In Progress",
      icon: Clock,
    },
    TODO: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: "To Do",
      icon: AlertCircle,
    },
  };

  const { bg, text, label, icon: Icon } = config[status] || config.TODO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// Enhanced Team Card Component
const TeamCard = ({ team, onDelete }) => {
  const memberCount = team.members?.length || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 rounded-lg">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">{team.name}</h3>
            </div>
            {team.description && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {team.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDelete(team.id)}
            className="text-gray-400 hover:text-red-600 transition p-1 opacity-0 group-hover:opacity-100"
            title="Delete team"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </span>
            </div>
            {team.owner && (
              <div className="text-xs text-gray-400">
                Owner: {team.owner.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
