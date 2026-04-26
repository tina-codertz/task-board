import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import TaskDetailModal from '../../components/manager/TaskDetailModal';
import Header from '../../components/layout/Header';
import ManagerTabNav from '../../components/manager/ManagerTabNav';
import TasksTab from '../../components/manager/TasksTab';
import TeamsTab from '../../components/manager/TeamsTab';
import { CreateTeamModal, AddMemberModal } from '../../components/manager/ManagerModal';
import { ErrorAlert } from '../../components/admin/Alerts';
import { taskAPI, teamAPI, authAPI } from '../../lib/api';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3,
  Award,
  Calendar,
  Activity,
  Zap,
  Target,
  PieChart,
  RefreshCw
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('tasks');
  const [teams, setTeams] = useState([]); // Initialize as empty array
  const [tasks, setTasks] = useState([]); // Initialize as empty array
  const [users, setUsers] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsData, tasksData, usersData] = await Promise.all([
        teamAPI.getAllTeams(),
        taskAPI.getAllTasks(),
        authAPI.getAllUsers(),
      ]);
      //  set arrays, even if the response is undefined
      setTeams(teamsData?.teams || []);
      setTasks(tasksData?.tasks || []);
      setUsers(usersData?.users || []);
    } catch (err) {
      setError(err.message);
      // Set empty arrays on error to prevent undefined errors
      setTeams([]);
      setTasks([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => { fetchData(); }, []);

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

  const buildTaskPayload = (data) => ({
    ...data,
    assignedToId: data.assignedToId ? parseInt(data.assignedToId) : null,
    teamId: data.teamId ? parseInt(data.teamId) : null,
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

  const handleViewTask = (task) => {
    setViewingTask(task);
    setShowTaskDetailModal(true);
  };

  // Safe calculations with fallback values
  const stats = {
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter(t => t?.status === 'DONE')?.length || 0,
    inProgressTasks: tasks?.filter(t => t?.status === 'IN_PROGRESS')?.length || 0,
    todoTasks: tasks?.filter(t => t?.status === 'TODO')?.length || 0,
    totalTeams: teams?.length || 0,
    totalMembers: teams?.reduce((sum, team) => sum + (team?.members?.length || 0), 0) || 0,
    completionRate: tasks?.length > 0 ? Math.round((tasks?.filter(t => t?.status === 'DONE')?.length / tasks?.length) * 100) : 0,
  };

  const availableMembers = selectedTeam
    ? (users?.filter(u => u?.role === 'USER' && !selectedTeam?.members?.some(m => m?.userId === u?.id)) || [])
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
      <Header title="Manager Dashboard" userName={user?.name} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} onClose={() => setError('')} />

        {/* Welcome Section with Stats Overview */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-blue-100 text-sm font-medium">Management Overview</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Manager'}! </h2>
                <p className="text-blue-100 text-sm max-w-lg">
                  Track team performance, manage tasks, and monitor project progress from your command center.
                </p>
              </div>
              
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickStatCard 
                  icon={Target} 
                  label="Completion" 
                  value={`${stats.completionRate}%`}
                  color="green"
                />
                <QuickStatCard 
                  icon={Activity} 
                  label="Active Tasks" 
                  value={stats.inProgressTasks}
                  color="yellow"
                />
                <QuickStatCard 
                  icon={Users} 
                  label="Teams" 
                  value={stats.totalTeams}
                  color="blue"
                />
                <QuickStatCard 
                  icon={Award} 
                  label="Members" 
                  value={stats.totalMembers}
                  color="purple"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Dashboard */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnalyticsCard
            icon={BarChart3}
            title="Total Tasks"
            value={stats.totalTasks}
            subtitle="All time"
            color="blue"
            trend={+12}
          />
          <AnalyticsCard
            icon={CheckCircle2}
            title="Completed"
            value={stats.completedTasks}
            subtitle={`${stats.completionRate}% of total`}
            color="green"
            trend={+8}
          />
          <AnalyticsCard
            icon={Clock}
            title="In Progress"
            value={stats.inProgressTasks}
            subtitle="Active tasks"
            color="orange"
            trend={-3}
          />
          <AnalyticsCard
            icon={AlertCircle}
            title="To Do"
            value={stats.todoTasks}
            subtitle="Pending tasks"
            color="red"
            trend={+5}
          />
        </div>

        {/* Tab Navigation with Refresh Button */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <ManagerTabNav activeTab={activeTab} onTabChange={setActiveTab} />
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Tab Content with Animation */}
        <div className="animate-fade-in">
          {activeTab === 'tasks' && (
            <TasksTab
              tasks={tasks || []}
              loading={loading}
              onCreateTask={() => { setEditingTask(null); setShowTaskModal(true); }}
              onEditTask={(task) => { setEditingTask(task); setShowTaskModal(true); }}
              onDeleteTask={handleDeleteTask}
              onCloseTask={handleCloseTask}
              onViewTask={handleViewTask}
            />
          )}

          {activeTab === 'teams' && (
            <TeamsTab
              teams={teams || []}
              loading={loading}
              onCreateTeam={() => setShowTeamModal(true)}
              onDeleteTeam={handleDeleteTeam}
              onAddMember={(team) => { setSelectedTeam(team); setShowAddMemberModal(true); }}
              onRemoveMember={handleRemoveMember}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showTaskModal}
        task={editingTask}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        isEditing={!!editingTask}
        teams={teams || []}
        users={users?.filter(u => u?.id !== user?.id && u?.role === 'USER') || []}
      />

      <TaskDetailModal
        isOpen={showTaskDetailModal}
        task={viewingTask}
        onClose={() => { setShowTaskDetailModal(false); setViewingTask(null); }}
        currentUserId={user?.id}
      />

      {/* Team Modals*/}
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

// QuickStatCard component
const QuickStatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    green: 'bg-green-500/20 border-green-400/30',
    yellow: 'bg-yellow-500/20 border-yellow-400/30',
    blue: 'bg-blue-500/20 border-blue-400/30',
    purple: 'bg-purple-500/20 border-purple-400/30',
  };

  const iconColors = {
    green: 'text-green-300',
    yellow: 'text-yellow-300',
    blue: 'text-blue-300',
    purple: 'text-purple-300',
  };

  return (
    <div className={`backdrop-blur-sm rounded-xl p-3 border ${colors[color]} transition-all hover:scale-105`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColors[color]}`} />
        <span className="text-xs text-white/70">{label}</span>
      </div>
      <div className="text-xl font-bold text-white mt-1">{value}</div>
    </div>
  );
};

// AnalyticsCard component
const AnalyticsCard = ({ icon: Icon, title, value, subtitle, color, trend }) => {
  const bgGradients = {
    blue: 'from-blue-50 to-indigo-50',
    green: 'from-green-50 to-emerald-50',
    orange: 'from-orange-50 to-amber-50',
    red: 'from-red-50 to-rose-50',
  };

  const iconBgs = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <div className={`bg-gradient-to-br ${bgGradients[color]} rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`${iconBgs[color]} p-2 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
};

export default ManagerDashboard;