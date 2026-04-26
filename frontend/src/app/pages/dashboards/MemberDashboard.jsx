import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import TaskStatsGrid from '../../components/tasks/TaskStatsGrid';
import StatusFilter from '../../components/tasks/StatusFilter';
import TaskList from '../../components/tasks/TaskList';
import TaskDetail from '../../components/tasks/TaskDetail';
import { ErrorAlert } from '../../components/admin/Alerts';
import { taskAPI, commentAPI, teamAPI } from '../../lib/api';
import { 
  Users, 
  ListTodo, 
  UserCheck, 
  Clock, 
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Calendar,
  Activity,
  TrendingUp,
  GitBranch,
  Layers,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateTaskStatus(taskId, newStatus);
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

  const filteredTasks = statusFilter === 'all' ? tasks : tasks.filter(t => t.status === statusFilter);
  
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header title="My Dashboard" userName={user?.name} onLogout={logout} />

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <ErrorAlert message={error} onClose={() => setError('')} />

        {/* Welcome Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-blue-100 text-sm font-medium">Welcome back!</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Hello, {user?.name?.split(' ')[0]} </h2>
              <p className="text-blue-100 text-sm max-w-md">
                Here's what's happening with your tasks today. {completionRate}% of your tasks are complete!
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                <Activity className="w-6 h-6 mx-auto mb-1 text-green-300" />
                <div className="text-2xl font-bold">{completionRate}%</div>
                <div className="text-xs text-blue-100">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Layers} label="Total Tasks" value={stats.total} color="blue" />
          <StatCard icon={Clock} label="To Do" value={stats.todo} color="yellow" />
          <StatCard icon={GitBranch} label="In Progress" value={stats.inProgress} color="orange" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.done} color="green" />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-gray-100 flex gap-1">
            <TabButton
              active={activeTab === 'tasks'}
              onClick={() => setActiveTab('tasks')}
              icon={ListTodo}
              label="My Tasks"
              badge={tasks.length}
            />
            <TabButton
              active={activeTab === 'teams'}
              onClick={() => setActiveTab('teams')}
              icon={Users}
              label="My Teams"
              badge={teams.length}
            />
          </div>
        </div>

        {/* Tasks View */}
        {activeTab === 'tasks' && (
          <div className="animate-slide-up">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <StatusFilter activeFilter={statusFilter} onChange={setStatusFilter} />
              <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                  <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-blue-600" />
                      Task List
                    </h3>
                  </div>
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                    <TaskList
                      tasks={filteredTasks}
                      loading={loading}
                      selectedTaskId={selectedTask?.id}
                      onSelectTask={setSelectedTask}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedTask ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-scale-in">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-medium">Task Details</span>
                        </div>
                        <button
                          onClick={() => setSelectedTask(null)}
                          className="text-white/80 hover:text-white transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
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
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ListTodo className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Task Selected</h3>
                    <p className="text-gray-500 text-sm">
                      Select a task from the list to view details, add comments, or update its status.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Teams View */}
        {activeTab === 'teams' && (
          <div className="animate-slide-up">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Loading your teams...</p>
                </div>
              </div>
            ) : teams.length > 0 ? (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Your Teams
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({teams.length} team{teams.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team, index) => (
                    <TeamCard key={team.id} team={team} index={index} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={Users}
                title="No Teams Assigned"
                message="You haven't been added to any teams yet. When a manager adds you to a team, it will appear here."
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
  };
  
  const bgColors = {
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
    orange: 'bg-orange-50',
    green: 'bg-green-50',
  };
  
  const iconColors = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColors[color]} p-2 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
    {badge > 0 && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

const TeamCard = ({ team, index }) => {
  const [membersExpanded, setMembersExpanded] = useState(false);
  const [tasksExpanded, setTasksExpanded] = useState(false);
  
  const completedTasks = team.tasks?.filter(t => t.status === 'DONE').length || 0;
  const totalTasks = team.tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const members = team.members || [];
  const tasks = team.tasks || [];
  
  const visibleMembers = membersExpanded ? members : members.slice(0, 4);
  const visibleTasks = tasksExpanded ? tasks : tasks.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
        <div className="flex items-start justify-between text-white">
          <div className="flex-1">
            <h3 className="font-semibold text-lg truncate">{team.name}</h3>
            {team.description && (
              <p className="text-blue-100 text-sm mt-1 line-clamp-2">{team.description}</p>
            )}
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        {/* Progress Bar */}
        {totalTasks > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Members Section  */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Team Members ({members.length})
            </h4>
            {members.length > 4 && (
              <button
                onClick={() => setMembersExpanded(!membersExpanded)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {membersExpanded ? (
                  <>Show Less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Show All <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
          
          {members.length > 0 ? (
            <div className={`space-y-2 overflow-y-auto transition-all duration-300 ${
              membersExpanded ? 'max-h-96' : 'max-h-48'
            }`}>
              {visibleMembers.map(member => (
                <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.user?.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No members yet</p>
          )}
        </div>
        
        {/* Tasks Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-blue-600" />
              Tasks ({totalTasks})
            </h4>
            {tasks.length > 3 && (
              <button
                onClick={() => setTasksExpanded(!tasksExpanded)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {tasksExpanded ? (
                  <>Show Less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Show All <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
          
          {tasks.length > 0 ? (
            <div className={`space-y-2 overflow-y-auto transition-all duration-300 ${
              tasksExpanded ? 'max-h-96' : 'max-h-48'
            }`}>
              {visibleTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      task.status === 'DONE'
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm max-w-sm mx-auto">{message}</p>
  </div>
);

export default MemberDashboard;