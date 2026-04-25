const FILTERS = [
  { value: 'all',         label: 'All Tasks'   },
  { value: 'TODO',        label: 'To Do'       },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done'        },
];

const StatusFilter = ({ activeFilter, onChange }) => (
  <div className="mb-8">
    <div className="bg-white rounded-lg border border-gray-200 p-2 flex gap-1 inline-flex shadow-sm">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-2 rounded-md font-medium transition ${
            activeFilter === value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default StatusFilter;