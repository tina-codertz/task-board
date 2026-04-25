import { Users, Edit2, Trash2 } from 'lucide-react';

const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'ADMIN':   return 'bg-red-100 text-red-800';
    case 'MANAGER': return 'bg-blue-100 text-blue-800';
    default:        return 'bg-gray-100 text-gray-800';
  }
};

const UsersTable = ({ users, currentUserId, onEditRole, onDeleteConfirm }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Users className="w-5 h-5" />
        User Management
      </h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(col => (
              <th key={col} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(u.role)}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm">
                {u.id !== currentUserId && (
                  <div className="flex gap-2">
                    <button onClick={() => onEditRole(u)} className="text-blue-600 hover:text-blue-800 p-2" title="Edit role">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteConfirm(u.id)} className="text-red-600 hover:text-red-800 p-2" title="Delete user">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default UsersTable;
