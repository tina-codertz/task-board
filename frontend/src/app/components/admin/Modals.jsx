
export const EditRoleModal = ({
  user,
  role,
  onRoleChange,
  onConfirm,
  onCancel,
}) => (
  <Modal onClose={onCancel}>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Change User Role
    </h2>

    <p className="text-gray-600 mb-4">
      {user.name} ({user.email})
    </p>

    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        New Role
      </label>

      <select
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select a role</option>
        <option value="USER">Member</option>
        <option value="MANAGER">Manager</option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>

    <ModalActions
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmLabel="Update Role"
      confirmClass="bg-blue-600 hover:bg-blue-700"
    />
  </Modal>
);



export const DeleteConfirmModal = ({ onConfirm, onCancel }) => (
  <Modal onClose={onCancel}>
    <h2 className="text-lg font-semibold text-red-600 mb-4">
      Delete User
    </h2>

    <p className="text-gray-600 mb-6">
      Are you sure you want to delete this user? This action cannot be undone.
    </p>

    <ModalActions
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmLabel="Delete"
      confirmClass="bg-red-600 hover:bg-red-700"
    />
  </Modal>
);




const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    onClick={onClose}
  >
    {/* Modal box */}
    <div
      className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);


const ModalActions = ({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmClass,
}) => (
  <div className="flex gap-3">
    <button
      onClick={onCancel}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
    >
      Cancel
    </button>

    <button
      onClick={onConfirm}
      className={`flex-1 px-4 py-2 text-white rounded-lg transition ${confirmClass}`}
    >
      {confirmLabel}
    </button>
  </div>
);

export default Modal;