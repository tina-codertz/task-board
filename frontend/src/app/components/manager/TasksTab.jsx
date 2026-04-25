// components/manager/TasksTab.jsx
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckSquare
} from 'lucide-react';

const TasksTab = ({ 
  tasks = [], // Add default value
  loading = false, // Add default value
  onCreateTask, 
  onEditTask, 
  onDeleteTask, 
  onCloseTask,
  onViewTask 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  // Safely filter tasks with optional chaining
  const filteredTasks = (tasks || []).filter(task => {
    const matchesSearch = task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || task?.status === statusFilter;
    const matchesTeam = teamFilter === 'all' || task?.teamId === parseInt(teamFilter);
    return matchesSearch && matchesStatus && matchesTeam;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'DONE': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'DONE': return <CheckCircle2 className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={onCreateTask}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <FilterChip 
          label="All" 
          active={statusFilter === 'all'} 
          onClick={() => setStatusFilter('all')}
        />
        <FilterChip 
          label="To Do" 
          active={statusFilter === 'TODO'} 
          onClick={() => setStatusFilter('TODO')}
          color="gray"
        />
        <FilterChip 
          label="In Progress" 
          active={statusFilter === 'IN_PROGRESS'} 
          onClick={() => setStatusFilter('IN_PROGRESS')}
          color="yellow"
        />
        <FilterChip 
          label="Completed" 
          active={statusFilter === 'DONE'} 
          onClick={() => setStatusFilter('DONE')}
          color="green"
        />
      </div>

      {/* Tasks Grid/List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState 
          title="No tasks found"
          message="Create your first task to get started with project management"
          action={onCreateTask}
          actionLabel="Create Task"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onView={onViewTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onClose={onCloseTask}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FilterChip = ({ label, active, onClick, color = 'blue' }) => {
  const activeStyles = {
    blue: 'bg-blue-600 text-white',
    yellow: 'bg-yellow-500 text-white',
    green: 'bg-green-600 text-white',
    gray: 'bg-gray-600 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        active 
          ? activeStyles[color]
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );
};

const TaskCard = ({ task, onView, onEdit, onDelete, onClose, getStatusColor, getStatusIcon }) => {
  const [showMenu, setShowMenu] = useState(false);

  if (!task) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                {task.status === 'DONE' ? 'Completed' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'}
              </span>
              {task.team && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {task.team.name}
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
            
            {task.assignedTo && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {task.assignedTo.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-gray-600">Assigned to {task.assignedTo.name}</span>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  <button
                    onClick={() => { onView(task); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => { onEdit(task); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {task.status !== 'DONE' && (
                    <button
                      onClick={() => { onClose(task.id); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => { onDelete(task.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, message, action, actionLabel }) => (
  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm mb-6">{message}</p>
    {action && (
      <button
        onClick={action}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
      >
        <Plus className="w-4 h-4" />
        {actionLabel}
      </button>
    )}
  </div>
);

export default TasksTab;