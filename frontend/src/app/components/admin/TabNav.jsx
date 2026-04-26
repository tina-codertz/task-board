import { Users, Plus, Activity, ListTodo, Users2 } from 'lucide-react';

const TABS = [
  { id: 'users', label: 'Manage Users', icon: Users },
  { id: 'add-user', label: 'Add User', icon: Plus },
  { id: 'tasks', label: 'All Tasks', icon: ListTodo },
  { id: 'teams', label: 'All Teams', icon: Users2 },
  { id: 'logs', label: 'Activity Logs', icon: Activity },
];

const TabNav = ({ activeTab, onTabChange }) => (
  <div className="mb-6 border-b border-gray-200">
    
    {/* Scroll container for mobile */}
    <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-4 px-1 sm:px-0">
      
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-2 whitespace-nowrap px-3 sm:px-4 py-2 sm:py-3 border-b-2 text-sm sm:text-base font-medium transition ${
            activeTab === id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          {label}
        </button>
      ))}

    </div>
  </div>
);

export default TabNav;