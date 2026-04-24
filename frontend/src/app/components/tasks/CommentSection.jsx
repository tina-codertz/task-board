import React, { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';

const CommentSection = ({ taskId, comments = [], onAddComment, onDeleteComment, currentUserId, canDelete = false }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(taskId, newComment);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Comments</h3>

      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {comments && comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {comment.user?.name || 'Anonymous'}
                </span>
                {(canDelete || currentUserId === comment.userId) && (
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-1">{comment.content}</p>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;