import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TaskDetailsModal = ({ isOpen, task, onClose, onSave, isEditing = false, teams = [], users = [] }) => {
  const [formData, setFormData] = useState(
    task || { title: '', description: '', status: 'TODO', assignedToId: null, teamId: null }
  );
  const [assignmentType, setAssignmentType] = useState('person');

  useEffect(() => {
    if (task) {
      setFormData(task);
      setAssignmentType(task.teamId ? 'team' : 'person');
    } else {
      setFormData({ title: '', description: '', status: 'TODO', assignedToId: null, teamId: null });
      setAssignmentType('person');
    }
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear the other assignment type when changing
      ...(name === 'assignedToId' && { teamId: null }),
      ...(name === 'teamId' && { assignedToId: null })
    }));
  };

  const handleAssignmentTypeChange = (type) => {
    setAssignmentType(type);
    setFormData(prev => ({
      ...prev,
      assignedToId: type === 'person' ? null : prev.assignedToId,
      teamId: type === 'team' ? null : prev.teamId
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
              placeholder="Task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleAssignmentTypeChange('person')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  assignmentType === 'person'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Person
              </button>
              <button
                type="button"
                onClick={() => handleAssignmentTypeChange('team')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  assignmentType === 'team'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Team
              </button>
            </div>

            {assignmentType === 'person' ? (
              <select
                name="assignedToId"
                value={formData.assignedToId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a person (optional)</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            ) : (
              <select
                name="teamId"
                value={formData.teamId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a team (optional)</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetailsModal;