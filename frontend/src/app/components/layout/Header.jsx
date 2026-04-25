import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ title, userName, onLogout }) => (
  <header className="bg-white shadow">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <Link to="/profile" className="text-gray-600 hover:text-gray-900 font-medium">
          {userName}
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  </header>
);

export default Header;
