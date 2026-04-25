import { Users, Shield, UserCheck } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </div>
      <Icon className={`w-12 h-12 opacity-20 ${colorClass}`} />
    </div>
  </div>
);

const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <StatCard label="Total Users" value={stats.totalUsers} icon={Users} colorClass="text-gray-900" />
    <StatCard label="Admins"      value={stats.admins}      icon={Shield}    colorClass="text-red-600"  />
    <StatCard label="Managers"   value={stats.managers}    icon={UserCheck} colorClass="text-blue-600" />
    <StatCard label="Members"    value={stats.members}     icon={Users}     colorClass="text-gray-600" />
  </div>
);

export default StatsGrid;
