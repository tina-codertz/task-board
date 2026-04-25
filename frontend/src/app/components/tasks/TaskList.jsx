import { Circle, Clock, CheckCircle, ChevronRight } from 'lucide-react';

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
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <Circle className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
        <Circle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No tasks assigned yet</p>
        <p className="text-gray-500 text-sm mt-1">Check back later for new assignments</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <button
          key={task.id}
          onClick={() => onSelectTask(task)}
          className={`w-full text-left p-4 rounded-lg border-2 transition transform hover:scale-105 ${
            selectedTaskId === task.id
              ? 'bg-blue-50 border-blue-400 shadow-md'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 flex-shrink-0">
              {STATUS_ICON[task.status] ?? STATUS_ICON.TODO}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
              <p className="text-sm text-gray-600 truncate mt-1">{task.team?.name || 'No team'}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_BADGE[task.status] ?? STATUS_BADGE.TODO}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            {selectedTaskId === task.id && (
              <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default TaskList;
