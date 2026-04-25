import React from 'react';
import { LogOut } from 'lucide-react';

/**
 * Common dashboard header component used across all dashboard pages
 */
const DashboardHeader = ({ title, userName, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {userName && (
            <p className="text-sm text-gray-600 mt-1">Welcome, {userName}</p>
          )}
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
