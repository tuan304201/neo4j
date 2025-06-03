import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  items: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, items }) => {
  return (
    <div 
      className={`
        ${isOpen ? 'w-64' : 'w-16'} 
        bg-white dark:bg-gray-800 
        transition-all duration-300 ease-in-out 
        border-r border-gray-200 dark:border-gray-700 
        flex flex-col 
        shadow-sm
        z-20
      `}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        {isOpen && (
          <div className="font-display text-xl font-bold text-primary-600 dark:text-primary-400">
            VNCS XOP
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {items.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center py-2 px-3 rounded-md
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  transition-colors duration-200
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
            v0.1.0 - VNCS XOP Solution
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;