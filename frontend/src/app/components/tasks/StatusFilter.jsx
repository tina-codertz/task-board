const FILTERS = [
  { value: 'all',         label: 'All'         },
  { value: 'TODO',        label: 'Todo'        },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done'        },
];

const StatusFilter = ({ activeFilter, onChange }) => (
  <div className="mb-6 flex gap-2">
    {FILTERS.map(({ value, label }) => (
      <button
        key={value}
        onClick={() => onChange(value)}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          activeFilter === value
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default StatusFilter;