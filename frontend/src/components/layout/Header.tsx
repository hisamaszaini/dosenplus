import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-20">
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* Tombol Hamburger untuk Mobile */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 hover:text-primary lg:hidden"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>

        {/* Judul Halaman (Bisa dibuat dinamis nanti) */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>

        {/* Dropdown Profil */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{user ? getInitials(user.name) : ''}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user ? formatRole(user.role) : ''}</p>
            </div>
            <i className={`hidden sm:block fas fa-chevron-down text-xs text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {/* Menu Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md border border-gray-200 py-1 z-50">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link
                to={`/${user?.role?.toLowerCase()}/profile`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i className="fas fa-user-circle w-5 text-center text-gray-400"></i>
                <span>Profil Saya</span>
              </Link>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <i className="fas fa-sign-out-alt w-5 text-center text-red-500"></i>
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;