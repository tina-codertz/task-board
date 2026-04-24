import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Users, LogOut, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaskCard from '../../components/tasks/TaskCard';
import TaskDetailsModal from '../../components/tasks/TaskDetailsModal';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [tabs, setTabs] = useState('tasks');
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({ name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch teams
      const teamsRes = await fetch(`${import.meta.env.VITE_API_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data.teams || []);
      }

      // Fetch tasks
      const tasksRes = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTeam)
      });

      if (!response.ok) throw new Error('Failed to create team');

      setNewTeam({ name: '' });
      setShowTeamModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/teams/${teamId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete team');

      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...taskData,
        teamId: selectedTeam?.id
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create task');

      setShowTaskModal(false);
      setEditingTask(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) throw new Error('Failed to update task');

      setShowTaskModal(false);
      setEditingTask(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete task');

      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'DONE' })
      });

      if (!response.ok) throw new Error('Failed to close task');

      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setTabs('tasks')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              tabs === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setTabs('teams')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              tabs === 'teams'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Teams
          </button>
        </div>

        {/* Tasks Tab */}
        {tabs === 'tasks' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">No tasks yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(task => (
                  <div key={task.id} className="relative">
                    <TaskCard
                      task={task}
                      onEdit={() => {
                        setEditingTask(task);
                        setShowTaskModal(true);
                      }}
                      onDelete={handleDeleteTask}
                      canEdit={true}
                      canDelete={true}
                    />
                    {task.status !== 'DONE' && (
                      <button
                        onClick={() => handleCloseTask(task.id)}
                        className="mt-2 w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
                      >
                        Mark as Done
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Teams Tab */}
        {tabs === 'teams' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
              <button
                onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Create Team
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">No teams yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map(team => (
                  <div key={team.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{team.members?.length || 0} members</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Task Modal */}
      <TaskDetailsModal
        isOpen={showTaskModal}
        task={editingTask}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        isEditing={!!editingTask}
      />

      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Team</h2>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter team name"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;