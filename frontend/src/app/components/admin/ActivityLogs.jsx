import { Activity } from 'lucide-react';

const getActionBadgeColor = (action) => {
  switch (action) {
    case 'CREATE': return 'bg-green-100 text-green-800';
    case 'UPDATE': return 'bg-blue-100 text-blue-800';
    case 'DELETE': return 'bg-red-100 text-red-800';
    default:       return 'bg-gray-100 text-gray-800';
  }
};

const ActivityLogsTable = ({ logs }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
     
    </div>

    {logs.length === 0 ? (
      <div className="px-6 py-8 text-center text-gray-500">No activity logs found</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Action', 'User', 'Role', 'Description', 'Date'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.user?.name || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.user?.role || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.description || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default ActivityLogsTable;
