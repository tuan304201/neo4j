import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
  title: string;
  actionIcon: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, toggleDarkMode, title, actionIcon }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10 transition-colors duration-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-display font-semibold text-gray-800 dark:text-white">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 focus:outline-none"
            aria-label="View notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-medium text-white">
              3
            </span>
          </button>
          
          <button
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 focus:outline-none"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {actionIcon}
          </button>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;