'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface StudentLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({
  children,
  pageTitle = 'Trang chủ',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['HOC_SINH']}>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex">
        {/* Responsive Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Column */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Topbar */}
          <Topbar
            title={pageTitle}
            onOpenMobileSidebar={() => setIsMobileOpen(true)}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};
