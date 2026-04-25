import { Users, Plus, Activity } from 'lucide-react';

const TABS = [
  { id: 'users',    label: 'Manage Users',   icon: Users    },
  { id: 'add-user', label: 'Add User',        icon: Plus     },
  { id: 'logs',     label: 'Activity Logs',  icon: Activity },
];

const TabNav = ({ activeTab, onTabChange }) => (
  <div className="mb-8 border-b border-gray-200">
    <div className="flex gap-4">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition ${
            activeTab === id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Icon className="w-5 h-5" />
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default TabNav;
