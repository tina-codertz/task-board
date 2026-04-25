import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ title, userName, onLogout }) => (
  <header className="bg-white shadow sticky top-0 z-50 w-full">
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-4 flex-wrap">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{title}</h1>
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-end">
        <Link 
          to="/profile" 
          className="text-gray-600 hover:text-gray-900 font-medium text-xs sm:text-sm md:text-base truncate"
        >
          {userName}
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-xs sm:text-sm whitespace-nowrap"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">Log out</span>
        </button>
      </div>
    </div>
  </header>
);

export default Header;
