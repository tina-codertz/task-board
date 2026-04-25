import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import TaskStatsGrid   from '../../components/tasks/TaskStatsGrid';
import StatusFilter    from '../../components/tasks/StatusFilter';
import TaskList        from '../../components/tasks/TaskList';
import TaskDetail      from '../../components/tasks/TaskDetail';
import { ErrorAlert }  from '../../components/admin/Alerts';
import { taskAPI, commentAPI } from '../../lib/api';

const MemberDashboard = () => {
  const { user, logout } = useAuth();

  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments,     setComments]     = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Data fetching 
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getAssignedTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const data = await commentAPI.getComments(taskId);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);
  useEffect(() => { if (selectedTask) fetchComments(selectedTask.id); }, [selectedTask]);

  // ── Handlers ─
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateTaskStatus(taskId, newStatus);
      // Optimistic local update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      if (selectedTask?.id === taskId) setSelectedTask(prev => ({ ...prev, status: newStatus }));
    } catch (err) { setError(err.message); }
  };

  const handleAddComment = async (taskId, content) => {
    try {
      await commentAPI.addComment(taskId, content);
      await fetchComments(taskId);
    } catch (err) { setError(err.message); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      if (selectedTask) await fetchComments(selectedTask.id);
    } catch (err) { setError(err.message); }
  };

  // ── Derived state 
  const filteredTasks = statusFilter === 'all' ? tasks : tasks.filter(t => t.status === statusFilter);

  const stats = {
    total:      tasks.length,
    todo:       tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done:       tasks.filter(t => t.status === 'DONE').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="My Tasks" userName={user?.name} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} onClose={() => setError('')} />

        {/* Stats Grid */}
        <div className="mb-10">
          <TaskStatsGrid stats={stats} />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <StatusFilter activeFilter={statusFilter} onChange={setStatusFilter} />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="inline-block w-1 h-6 bg-blue-600 rounded"></span>
                Tasks
              </h2>
              <TaskList
                tasks={filteredTasks}
                loading={loading}
                selectedTaskId={selectedTask?.id}
                onSelectTask={setSelectedTask}
              />
            </div>
          </div>

          {/* Task Detail */}
          {selectedTask && (
            <div className="lg:col-span-2">
              <TaskDetail
                task={selectedTask}
                comments={comments}
                currentUserId={user?.id}
                onStatusChange={handleStatusChange}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;
