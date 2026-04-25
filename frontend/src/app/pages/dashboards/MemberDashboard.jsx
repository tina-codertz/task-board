import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import TaskStatsGrid   from '../../components/tasks/TaskStatsGrid';
import StatusFilter    from '../../components/tasks/StatusFilter';
import TaskList        from '../../components/tasks/TaskList';
import TaskDetail      from '../../components/tasks/TaskDetail';
import { ErrorAlert }  from '../../components/admin/Alerts';
import { taskAPI, commentAPI, teamAPI } from '../../lib/api';
import { Users, ListTodo } from 'lucide-react';

const MemberDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab,      setActiveTab]      = useState('tasks');
  const [tasks,          setTasks]          = useState([]);
  const [teams,          setTeams]          = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [selectedTask,   setSelectedTask]   = useState(null);
  const [comments,       setComments]       = useState([]);
  const [statusFilter,   setStatusFilter]   = useState('all');

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

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.getMyTeams();
      const teamsList = Array.isArray(data) ? data : (data.teams || []);
      setTeams(teamsList);
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
  useEffect(() => {
    if (activeTab === 'teams') {
      fetchTeams();
    }
  }, [activeTab]);

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
      <Header title="My Dashboard" userName={user?.name} onLogout={logout} />

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <ErrorAlert message={error} onClose={() => setError('')} />

        {/* Stats Grid - Sticky with proper z-index */}
        <div className="mb-6 sm:mb-8 sticky top-16 z-20 bg-gradient-to-br from-gray-50 to-gray-100 pb-4">
          <TaskStatsGrid stats={stats} />
        </div>

        {/* Tab Navigation - Responsive and Sticky */}
        <div className="mb-6 sm:mb-8 sticky top-80 sm:top-72 md:top-96 z-15 flex flex-wrap gap-2 bg-white rounded-lg border border-gray-200 p-2 shadow-sm w-full">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 sm:px-4 py-2 rounded-md font-medium transition flex items-center gap-2 flex-1 sm:flex-none justify-center sm:justify-start whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span className="hidden sm:inline">My Tasks</span>
            <span className="sm:hidden">Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-3 sm:px-4 py-2 rounded-md font-medium transition flex items-center gap-2 flex-1 sm:flex-none justify-center sm:justify-start whitespace-nowrap ${
              activeTab === 'teams'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">My Teams</span>
            <span className="sm:hidden">Teams</span>
          </button>
        </div>

        {/* Tasks View */}
        {activeTab === 'tasks' && (
          <>
            <div className="mb-6">
              <StatusFilter activeFilter={statusFilter} onChange={setStatusFilter} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Task List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 h-auto sm:h-[500px] md:h-[600px] flex flex-col">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 flex-shrink-0">
                    <span className="inline-block w-1 h-6 bg-blue-600 rounded"></span>
                    <span className="truncate">Tasks</span>
                  </h2>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <TaskList
                      tasks={filteredTasks}
                      loading={loading}
                      selectedTaskId={selectedTask?.id}
                      onSelectTask={setSelectedTask}
                    />
                  </div>
                </div>
              </div>

              {/* Task Detail */}
              {selectedTask && (
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 max-h-[600px] md:max-h-[800px] overflow-y-auto">
                    <TaskDetail
                      task={selectedTask}
                      comments={comments}
                      currentUserId={user?.id}
                      onStatusChange={handleStatusChange}
                      onAddComment={handleAddComment}
                      onDeleteComment={handleDeleteComment}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Teams View */}
        {activeTab === 'teams' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Teams</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading teams...</div>
            ) : teams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {teams.map(team => (
                  <div key={team.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 p-4 sm:p-6 flex flex-col h-auto sm:h-96">
                    {/* Team Header */}
                    <div className="mb-4 flex-shrink-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{team.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{team.description || 'No description'}</p>
                    </div>

                    {/* Members */}
                    <div className="mb-4 pb-4 border-b border-gray-200 flex-1 flex flex-col min-h-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 flex-shrink-0">
                        <Users className="w-4 h-4" />
                        <span>Members ({team.members?.length || 0})</span>
                      </h4>
                      {team.members && team.members.length > 0 ? (
                        <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
                          {team.members.map(member => (
                            <div
                              key={member.id}
                              className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-100 min-w-0"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{member.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500 truncate">{member.user?.email || '—'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-500">No members in this team</p>
                      )}
                    </div>

                    {/* Team Tasks */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 flex-shrink-0">
                        <ListTodo className="w-4 h-4" />
                        <span>Tasks</span>
                      </h4>
                      {team.tasks && team.tasks.length > 0 ? (
                        <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
                          {team.tasks.map(task => (
                            <div
                              key={task.id}
                              className="flex items-start justify-between p-2 bg-blue-50 rounded border border-blue-100 min-w-0 gap-2"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  task.status === 'DONE'
                                    ? 'bg-green-100 text-green-800'
                                    : task.status === 'IN_PROGRESS'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-500">No tasks in this team</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No teams assigned</p>
                <p className="text-gray-500 text-sm mt-1">You'll see teams here when managers assign you to them</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MemberDashboard;
