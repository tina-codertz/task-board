import CommentSection from '../../components/tasks/CommentSection';

const STATUS_ACTIONS = [
  { status: 'TODO',        label: '○ Move to To Do',      borderClass: 'border-gray-300',  textClass: 'text-gray-700',  hoverClass: 'hover:bg-gray-50'   },
  { status: 'IN_PROGRESS', label: '⟳ Move to In Progress', borderClass: 'border-yellow-300', textClass: 'text-yellow-700', hoverClass: 'hover:bg-yellow-50' },
  { status: 'DONE',        label: '✓ Mark as Done',        borderClass: 'border-green-300',  textClass: 'text-green-700',  hoverClass: 'hover:bg-green-50'  },
];

const TaskDetail = ({ task, comments, currentUserId, onStatusChange, onAddComment, onDeleteComment }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h2>

    {task.description && (
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-gray-600 leading-relaxed">{task.description}</p>
      </div>
    )}

    {/* Status actions — only show buttons for statuses other than current */}
    <div className="mb-6">
      <h3 className="font-semibold text-gray-700 mb-3">Update Status</h3>
      <div className="space-y-2">
        {STATUS_ACTIONS.filter(a => a.status !== task.status).map(({ status, label, borderClass, textClass, hoverClass }) => (
          <button
            key={status}
            onClick={() => onStatusChange(task.id, status)}
            className={`w-full px-4 py-2 border ${borderClass} rounded-lg ${textClass} ${hoverClass} transition text-left`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    {/* Meta */}
    <div className="mb-6 pb-6 border-b border-gray-200">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Current Status</p>
          <p className="font-semibold text-gray-900 mt-1">{task.status.replace('_', ' ')}</p>
        </div>
        {task.createdBy && (
          <div>
            <p className="text-gray-600">Created by</p>
            <p className="font-semibold text-gray-900 mt-1">{task.createdBy.name}</p>
          </div>
        )}
      </div>
    </div>

    <CommentSection
      taskId={task.id}
      comments={comments}
      onAddComment={onAddComment}
      onDeleteComment={onDeleteComment}
      currentUserId={currentUserId}
      canDelete={false}
    />
  </div>
);

export default TaskDetail;
