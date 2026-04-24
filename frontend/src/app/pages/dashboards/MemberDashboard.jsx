import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Circle, Clock, MessageCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import CommentSection from '../../components/tasks/CommentSection';

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      fetchComments(selectedTask.id);
    }
  }, [selectedTask]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/assigned`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update task status');

      // Update local state
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddComment = async (taskId, content) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to add comment');

      await fetchComments(taskId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      if (selectedTask) {
        await fetchComments(selectedTask.id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTasks = statusFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === statusFilter);

  const stats = {
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    total: tasks.length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'TODO':
        return <Circle className="w-5 h-5 text-gray-400" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'DONE':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DONE':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">To Do</p>
                <p className="text-3xl font-bold text-gray-600">{stats.todo}</p>
              </div>
              <Circle className="w-12 h-12 text-gray-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.done}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-300" />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2">
          {['all', 'TODO', 'IN_PROGRESS', 'DONE'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tasks List */}
          <div className="lg:col-span-1">
            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading your tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">No tasks assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      selectedTask?.id === task.id
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-white border-gray-200 hover:shadow'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Task Details */}
          {selectedTask && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedTask.title}</h2>

                {selectedTask.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedTask.description}</p>
                  </div>
                )}

                {/* Status Buttons */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Update Status</h3>
                  <div className="space-y-2">
                    {selectedTask.status !== 'TODO' && (
                      <button
                        onClick={() => handleStatusChange(selectedTask.id, 'TODO')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-left"
                      >
                        ○ Move to To Do
                      </button>
                    )}
                    {selectedTask.status !== 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusChange(selectedTask.id, 'IN_PROGRESS')}
                        className="w-full px-4 py-2 border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition text-left"
                      >
                        ⟳ Move to In Progress
                      </button>
                    )}
                    {selectedTask.status !== 'DONE' && (
                      <button
                        onClick={() => handleStatusChange(selectedTask.id, 'DONE')}
                        className="w-full px-4 py-2 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition text-left"
                      >
                        ✓ Mark as Done
                      </button>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Status</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedTask.status.replace('_', ' ')}</p>
                    </div>
                    {selectedTask.createdBy && (
                      <div>
                        <p className="text-gray-600">Created by</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedTask.createdBy.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <CommentSection
                  taskId={selectedTask.id}
                  comments={comments}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  currentUserId={user?.id}
                  canDelete={false}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;