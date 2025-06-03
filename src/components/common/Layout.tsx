import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AlertTriangle, Activity, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        items={[
          { 
            icon: <AlertTriangle size={20} />, 
            label: 'Alerts', 
            path: '/alerts' 
          },
          { 
            icon: <Activity size={20} />, 
            label: 'Topology', 
            path: '/topology' 
          },
        ]} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          title="VNCS XOP Solution"
          actionIcon={darkMode ? <Sun size={20} /> : <Moon size={20} />}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;