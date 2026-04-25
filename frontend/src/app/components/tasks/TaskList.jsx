import { Circle, Clock, CheckCircle } from 'lucide-react';

const STATUS_ICON = {
  TODO:        <Circle      className="w-5 h-5 text-gray-400"   />,
  IN_PROGRESS: <Clock       className="w-5 h-5 text-yellow-500" />,
  DONE:        <CheckCircle className="w-5 h-5 text-green-500"  />,
};

const STATUS_BADGE = {
  TODO:        'bg-gray-100 text-gray-800 border-gray-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  DONE:        'bg-green-100 text-green-800 border-green-300',
};

const TaskList = ({ tasks, loading, selectedTaskId, onSelectTask }) => {
  if (loading) return <div className="text-center py-8 text-gray-600">Loading your tasks...</div>;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-600">No tasks assigned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <button
          key={task.id}
          onClick={() => onSelectTask(task)}
          className={`w-full text-left p-4 rounded-lg border transition ${
            selectedTaskId === task.id
              ? 'bg-blue-50 border-blue-300 shadow-md'
              : 'bg-white border-gray-200 hover:shadow'
          }`}
        >
          <div className="flex items-start gap-3">
            {STATUS_ICON[task.status] ?? STATUS_ICON.TODO}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium border ${STATUS_BADGE[task.status] ?? STATUS_BADGE.TODO}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TaskList;
