import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
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

  // ── Data fetching
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
      setLoading(true);
      const data = await taskAPI.getAllTasks();
      setTasks(data.tasks || []);
    } catch {
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.getAllTeams();
      setTeams(data.teams || []);
    } catch {
      setError("Failed to fetch teams");
    } finally {
      setLoading(false);
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

  // ── Handlers 
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
      return true; // signals success to AddUserForm so it resets
    } catch (err) {
      setError(err.message || "Failed to create user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state
  if (loading && activeTab === "users") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              {user?.name}
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} onClose={() => setError("")} />
        <SuccessAlert message={success} onClose={() => setSuccess("")} />

        {activeTab === "users" && <StatsGrid stats={stats} />}

        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "users" && (
          <UsersTable
            users={users}
            currentUserId={user?.id}
            onEditRole={(u) => {
              setEditingUser(u);
              setNewRole(u.role);
            }}
            onDeleteConfirm={setDeleteConfirm}
          />
        )}

        {activeTab === "add-user" && (
          <AddUserForm
            onSubmit={handleAddUser}
            onCancel={() => setActiveTab("users")}
            loading={loading}
          />
        )}

        {activeTab === "logs" && <ActivityLogsTable logs={logs} />}

        {activeTab === "tasks" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Tasks</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Title', 'Team', 'Assigned To', 'Status', 'Actions'].map(col => (
                        <th key={col} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks && tasks.length > 0 ? (
                      tasks.map(task => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{task.team?.name || '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{task.assignedTo?.name || '—'}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              task.status === 'DONE' ? 'bg-green-100 text-green-800' : 
                              task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No tasks found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "teams" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams && teams.length > 0 ? (
                teams.map(team => (
                  <div key={team.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{team.description || 'No description'}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{team.members?.length || 0} members</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No teams found.
                </div>
              )}
            </div>
          </div>
        )}
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

export default AdminDashboard;
