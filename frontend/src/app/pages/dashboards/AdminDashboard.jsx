import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminAPI, activityLogAPI } from "../../api/api";

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

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (activeTab === "logs") fetchLogs();
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
