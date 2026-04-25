import { Circle, Clock, CheckCircle, BarChart3 } from 'lucide-react';

const StatCard = ({ label, value, colorClass, icon: Icon, iconColorClass, bgClass }) => (
  <div className={`${bgClass} rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-4xl font-bold mt-2 ${colorClass}`}>{value}</p>
      </div>
      {Icon && <Icon className={`w-14 h-14 ${iconColorClass}`} />}
    </div>
  </div>
);

const TaskStatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatCard 
      label="Total Tasks" 
      value={stats.total} 
      colorClass="text-gray-900" 
      icon={BarChart3}
      iconColorClass="text-gray-300"
      bgClass="bg-white"
    />
    <StatCard 
      label="To Do" 
      value={stats.todo} 
      colorClass="text-gray-600" 
      icon={Circle} 
      iconColorClass="text-gray-200"
      bgClass="bg-gray-50"
    />
    <StatCard 
      label="In Progress" 
      value={stats.inProgress} 
      colorClass="text-yellow-600" 
      icon={Clock} 
      iconColorClass="text-yellow-200"
      bgClass="bg-yellow-50"
    />
    <StatCard 
      label="Completed" 
      value={stats.done} 
      colorClass="text-green-600" 
      icon={CheckCircle} 
      iconColorClass="text-green-200"
      bgClass="bg-green-50"
    />
  </div>
);

export default TaskStatsGrid;
