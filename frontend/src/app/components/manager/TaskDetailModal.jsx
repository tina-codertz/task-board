import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CommentSection from '../tasks/CommentSection';
import { commentAPI } from '../../lib/api';

const TaskDetailModal = ({ isOpen, task, onClose, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      fetchComments();
    }
  }, [isOpen, task]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getComments(task.id);
      setComments(response.comments || response || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (taskId, content) => {
    try {
      await commentAPI.addComment(taskId, content);
      await fetchComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      throw err;
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Description</h3>
              <p className="text-gray-900">{task.description || 'No description provided'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Status</h3>
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
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Team</h3>
                <p className="text-gray-900">{task.team?.name || '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Assigned To</h3>
                <p className="text-gray-900">{task.assignedTo?.name || '—'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Created By</h3>
                <p className="text-gray-900">{task.createdBy?.name || '—'}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading comments...</div>
            ) : (
              <CommentSection
                taskId={task.id}
                comments={comments}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                currentUserId={currentUserId}
                canDelete={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
