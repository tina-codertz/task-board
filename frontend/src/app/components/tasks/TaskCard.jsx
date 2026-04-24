import React from 'react';
import { Edit2, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, canEdit = false, canDelete = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'TODO':
        return <Circle className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      case 'DONE':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{task.title}</h3>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      <div className="flex justify-between items-center">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {getStatusIcon(task.status)}
          {task.status.replace('_', ' ')}
        </span>

        {task.assignedTo && (
          <span className="text-xs text-gray-500">
            Assigned to: <span className="font-medium">{task.assignedTo.name}</span>
          </span>
        )}
      </div>

      {onStatusChange && (
        <div className="mt-3 flex gap-2">
          {task.status !== 'TODO' && (
            <button
              onClick={() => onStatusChange(task.id, 'TODO')}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
            >
              Todo
            </button>
          )}
          {task.status !== 'IN_PROGRESS' && (
            <button
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded transition"
            >
              In Progress
            </button>
          )}
          {task.status !== 'DONE' && (
            <button
              onClick={() => onStatusChange(task.id, 'DONE')}
              className="text-xs bg-green-200 hover:bg-green-300 px-2 py-1 rounded transition"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
