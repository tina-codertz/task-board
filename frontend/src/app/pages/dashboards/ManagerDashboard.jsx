import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TaskDetailsModal from '../../components/tasks/TaskDetail';
import DashboardHeader from '../shared/components/DashboardHeader';
import ManagerTabNav from '../../components/manager/ManagerTabNav';
import TasksTab from '../../components/manager/TasksTab';
import TeamsTab from '../../components/manager/TeamsTab';
import { CreateTeamModal, AddMemberModal } from '../../components/manager/ManagerModal';
import { ErrorAlert } from '../../components/admin/Alerts';
import { taskAPI, teamAPI, adminAPI } from '../../api/api';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab,          setActiveTab]          = useState('tasks');
  const [teams,              setTeams]              = useState([]);
  const [tasks,              setTasks]              = useState([]);
  const [users,              setUsers]              = useState([]);
  const [loading,            setLoading]            = useState(false);
  const [error,              setError]              = useState('');
  const [showTaskModal,      setShowTaskModal]      = useState(false);
  const [showTeamModal,      setShowTeamModal]      = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingTask,        setEditingTask]        = useState(null);
  const [selectedTeam,       setSelectedTeam]       = useState(null);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsData, tasksData, usersData] = await Promise.all([
        teamAPI.getAllTeams(),
        taskAPI.getAllTasks(),
        adminAPI.getAllUsers(),
      ]);
      setTeams(teamsData.teams || []);
      setTasks(tasksData.tasks || []);
      setUsers(usersData.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Team handlers ───────────────────────────────────────────────────────────
  const handleCreateTeam = async ({ name }) => {
    try {
      await teamAPI.createTeam(name, '');
      setShowTeamModal(false);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      await teamAPI.deleteTeam(teamId);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleAddMember = async (userId) => {
    try {
      await teamAPI.addMember(selectedTeam.id, userId);
      setShowAddMemberModal(false);
      setSelectedTeam(null);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    if (!confirm('Remove this member from the team?')) return;
    try {
      await teamAPI.removeMember(teamId, memberId);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  // ── Task handlers ───────────────────────────────────────────────────────────
  const buildTaskPayload = (data) => ({
    ...data,
    assignedToId: data.assignedToId ? parseInt(data.assignedToId) : null,
    teamId:       data.teamId       ? parseInt(data.teamId)       : null,
  });

  const handleCreateTask = async (taskData) => {
    try {
      const payload = buildTaskPayload(taskData);
      await taskAPI.createTask(payload.title, payload.description, payload.status, payload.teamId, payload.assignedToId);
      setShowTaskModal(false);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const payload = buildTaskPayload(taskData);
      await taskAPI.updateTask(editingTask.id, payload.title, payload.description, payload.status, payload.assignedToId);
      setShowTaskModal(false);
      setEditingTask(null);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.deleteTask(taskId);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleCloseTask = async (taskId) => {
    try {
      await taskAPI.updateTaskStatus(taskId, 'DONE');
      fetchData();
    } catch (err) { setError(err.message); }
  };

  // ── Derived state ───────────────────────────────────────────────────────────
  const availableMembers = selectedTeam
    ? users.filter(u => !selectedTeam.members?.some(m => m.userId === u.id))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Manager Dashboard" userName={user?.name} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} onClose={() => setError('')} />

        <ManagerTabNav activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            loading={loading}
            onCreateTask={() => { setEditingTask(null); setShowTaskModal(true); }}
            onEditTask={(task) => { setEditingTask(task); setShowTaskModal(true); }}
            onDeleteTask={handleDeleteTask}
            onCloseTask={handleCloseTask}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsTab
            teams={teams}
            loading={loading}
            onCreateTeam={() => setShowTeamModal(true)}
            onDeleteTeam={handleDeleteTeam}
            onAddMember={(team) => { setSelectedTeam(team); setShowAddMemberModal(true); }}
            onRemoveMember={handleRemoveMember}
          />
        )}
      </main>

      {/* Task Modal */}
      <TaskDetailsModal
        isOpen={showTaskModal}
        task={editingTask}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        isEditing={!!editingTask}
        teams={teams}
        users={users.filter(u => u.id !== user?.id)}
      />

      {/* Team Modals */}
      {showTeamModal && (
        <CreateTeamModal onClose={() => setShowTeamModal(false)} onSubmit={handleCreateTeam} />
      )}

      {showAddMemberModal && (
        <AddMemberModal
          team={selectedTeam}
          availableMembers={availableMembers}
          onClose={() => { setShowAddMemberModal(false); setSelectedTeam(null); }}
          onSubmit={handleAddMember}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;
