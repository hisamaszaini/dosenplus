import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { menuConfig } from '../../config/menuConfig';
import type { MenuDropdown as MenuDropdownType, MenuItem, NavigationItem } from '../../types/navigation.types';

const SidebarDropdown = ({ item }: { item: MenuDropdownType }) => {
  const location = useLocation();
  const isActive = item.children.some(child => location.pathname.startsWith(child.path));
  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive, location.pathname]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-white rounded-lg hover:bg-white/10"
      >
        <div className="flex items-center">
          <i className={`${item.icon} w-5 h-5 mr-3`}></i>
          <span className="font-medium">{item.label}</span>
        </div>
        <i className={`fas fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-3.5">
          {item.children.map((child: MenuItem) => (
            <NavLink 
              key={child.path} 
              to={child.path} 
              className={({ isActive }) => 
                `block px-3 py-2 text-sm rounded-md ${
                  isActive 
                    ? 'bg-white text-primary font-semibold' 
                    : 'text-white/80 hover:text-white'
                }`
              }
            >
              <i className={`${child.icon} w-4 h-4 mr-2 opacity-70`}></i> {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const menuItems = user ? menuConfig[user.role] || [] : [];
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 sidebar-primary-gradient flex-shrink-0 flex flex-col h-full">
      <div className="py-4 px-6 border-b border-white/20 flex items-center justify-center">
        <div className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-full p-1">
          <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-xl"></i>
          </div>
        </div>
        <h1 className="text-white ml-3 text-lg font-semibold">SIDUPAK</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto sidebar-scroll">
        {menuItems.map((item: NavigationItem, index: number) => (
          item.children ? (
            <SidebarDropdown key={index} item={item} />
          ) : item.isLogout ? (
            <button
              key={index}
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`flex items-center px-4 py-2.5 rounded-lg w-full text-left ${
                isLoggingOut 
                  ? 'text-white/50 cursor-not-allowed' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className={`${item.icon} w-5 h-5 mr-3 ${isLoggingOut ? 'animate-spin' : ''}`}></i>
              <span className="font-medium">
                {isLoggingOut ? 'Logging out...' : item.label}
              </span>
            </button>
          ) : (
            <NavLink
              key={item.path}
              to={item.path!}
              end
              className={({ isActive }) => 
                `flex items-center px-4 py-2.5 rounded-lg ${
                  isActive 
                    ? 'bg-white text-primary font-semibold shadow' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <i className={`${item.icon} w-5 h-5 mr-3`}></i>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;