import { Circle, Clock, CheckCircle } from 'lucide-react';

const StatCard = ({ label, value, colorClass, icon: Icon, iconColorClass }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </div>
      {Icon && <Icon className={`w-12 h-12 ${iconColorClass}`} />}
    </div>
  </div>
);

const TaskStatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <StatCard label="Total Tasks"  value={stats.total}      colorClass="text-gray-900"   />
    <StatCard label="To Do"        value={stats.todo}       colorClass="text-gray-600"   icon={Circle}      iconColorClass="text-gray-300"  />
    <StatCard label="In Progress"  value={stats.inProgress} colorClass="text-yellow-600" icon={Clock}       iconColorClass="text-yellow-300" />
    <StatCard label="Completed"    value={stats.done}       colorClass="text-green-600"  icon={CheckCircle} iconColorClass="text-green-300"  />
  </div>
);

export default TaskStatsGrid;
