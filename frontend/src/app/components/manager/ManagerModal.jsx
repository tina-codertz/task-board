import { useState } from 'react';
import { X } from 'lucide-react';

// ── Shared layout 
const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ModalActions = ({ onCancel, submitLabel, disabled }) => (
  <div className="flex gap-3 pt-4">
    <button
      type="button"
      onClick={onCancel}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={disabled}
      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
    >
      {submitLabel}
    </button>
  </div>
);

// ── CreateTeamModal
export const CreateTeamModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name });
    setName('');
  };

  return (
    <ModalShell title="Create Team" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter team name"
          />
        </div>
        <ModalActions onCancel={onClose} submitLabel="Create" />
      </form>
    </ModalShell>
  );
};

// ── AddMemberModal 
export const AddMemberModal = ({ team, availableMembers, onClose, onSubmit }) => {
  const [selectedMember, setSelectedMember] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    onSubmit(parseInt(selectedMember));
    setSelectedMember('');
  };

  return (
    <ModalShell title={`Add Member to ${team?.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Member *</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a member...</option>
            {availableMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
            ))}
          </select>
          {availableMembers.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Add users</p>
          )}
        </div>
        <ModalActions
          onCancel={onClose}
          submitLabel="Add Member"
          disabled={availableMembers.length === 0}
        />
      </form>
    </ModalShell>
  );
};
