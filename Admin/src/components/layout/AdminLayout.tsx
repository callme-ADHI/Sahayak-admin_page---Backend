import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div
        className={`
            min-h-screen flex flex-col transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'ml-20' : 'ml-64'} 
        `}
      >
        <TopNav onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 p-8 animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
