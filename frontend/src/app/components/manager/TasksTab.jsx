import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

const TasksTab = ({
  tasks,
  loading,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onCloseTask,
}) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading tasks...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <button
          onClick={onCreateTask}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Title', 'Description', 'Status', 'Team', 'Assigned To', 'Actions'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks && tasks.length > 0 ? (
                tasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {task.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === 'DONE'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.team?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.assignedTo?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditTask(task)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Edit task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {task.status !== 'DONE' && (
                          <button
                            onClick={() => onCloseTask(task.id)}
                            className="text-green-600 hover:text-green-800 p-2"
                            title="Mark as done"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No tasks found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TasksTab;
