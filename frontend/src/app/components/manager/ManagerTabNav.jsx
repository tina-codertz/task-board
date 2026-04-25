const TABS = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'teams', label: 'Teams' },
];

const ManagerTabNav = ({ activeTab, onTabChange }) => (
  <div className="flex gap-4 mb-8 border-b border-gray-200">
    {TABS.map(({ id, label }) => (
      <button
        key={id}
        onClick={() => onTabChange(id)}
        className={`px-4 py-2 font-medium border-b-2 transition ${
          activeTab === id
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default ManagerTabNav;
