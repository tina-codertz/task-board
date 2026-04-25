import { CheckCircle, Clock, Circle, User } from 'lucide-react';
import CommentSection from '../../components/tasks/CommentSection';

const STATUS_CONFIG = {
  TODO:        { icon: Circle,      label: 'To Do',      color: 'gray' },
  IN_PROGRESS: { icon: Clock,       label: 'In Progress', color: 'yellow' },
  DONE:        { icon: CheckCircle, label: 'Done',       color: 'green' },
};

const STATUS_ACTIONS = [
  { status: 'TODO',        label: 'Move to To Do',      icon: Circle,      color: 'gray' },
  { status: 'IN_PROGRESS', label: 'Move to In Progress', icon: Clock,       color: 'yellow' },
  { status: 'DONE',        label: 'Mark as Done',       icon: CheckCircle, color: 'green' },
];

const getButtonStyles = (color) => {
  const styles = {
    gray: 'border-gray-300 text-gray-700 hover:bg-gray-50',
    yellow: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50',
    green: 'border-green-300 text-green-700 hover:bg-green-50',
  };
  return styles[color] || styles.gray;
};

const TaskDetail = ({ task, comments, currentUserId, onStatusChange, onAddComment, onDeleteComment }) => {
  if (!task) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 sticky top-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Select a task to view details</p>
        </div>
      </div>
    );
  }

  const currentStatus = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const StatusIcon = currentStatus.icon;
  const statusColors = {
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 sticky top-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start gap-3 mb-2">
          <StatusIcon className={`w-6 h-6 text-${currentStatus.color}-600 flex-shrink-0 mt-1`} />
          <h2 className="text-2xl font-bold text-gray-900 flex-1">{task.title}</h2>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-block px-4 py-2 rounded-lg border ${statusColors[currentStatus.color]}`}>
        <span className="font-medium text-sm">{currentStatus.label}</span>
      </div>

      {/* Description */}
      {task.description && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-700">Description</h3>
          <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">{task.description}</p>
        </div>
      )}

      {/* Status actions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-700">Update Status</h3>
        <div className="space-y-2">
          {STATUS_ACTIONS.filter(a => a.status !== task.status).map(({ status, label, icon: Icon, color }) => (
            <button
              key={status}
              onClick={() => onStatusChange(task.id, status)}
              className={`w-full px-4 py-3 border rounded-lg font-medium transition flex items-center gap-2 ${getButtonStyles(color)}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Meta Information */}
      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-1 gap-4">
          {task.team && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-blue-600 font-semibold">Team</div>
              <div className="text-blue-900 font-medium">{task.team.name}</div>
            </div>
          )}
          {task.createdBy && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <User className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-purple-600 text-xs font-semibold uppercase">Created by</div>
                <div className="text-purple-900 font-medium">{task.createdBy.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t border-gray-200 pt-6">
        <CommentSection
          taskId={task.id}
          comments={comments}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          currentUserId={currentUserId}
          canDelete={false}
        />
      </div>
    </div>
  );
};

export default TaskDetail;
