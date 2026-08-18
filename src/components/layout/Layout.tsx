import React from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
      <div className="flex-shrink-0 w-56 border-r border-slate-200">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-8 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
