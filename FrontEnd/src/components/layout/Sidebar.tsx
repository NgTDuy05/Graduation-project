'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  School,
  Target,
  MessageSquare,
  Trophy,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const navItems = [
    {
      label: 'Trang chủ',
      href: '/student',
      icon: LayoutDashboard,
    },
    {
      label: 'Học bài',
      href: '/student/study',
      icon: BookOpen,
      badge: 'Lớp 6-12',
    },
    {
      label: 'Lớp học',
      href: '/student/classes',
      icon: School,
    },
    {
      label: 'Ôn luyện',
      href: '/student/practice',
      icon: Target,
    },
    {
      label: 'Tin nhắn',
      href: '/student/chat',
      icon: MessageSquare,
    },
    {
      label: 'Bảng xếp hạng',
      href: '/student/leaderboard',
      icon: Trophy,
    },
  ];

  const handleCopyCode = () => {
    if (user?.studentCode) {
      navigator.clipboard.writeText(user.studentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeMobileSidebar = () => {
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-sm ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Brand */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            <Link
              href="/student"
              onClick={closeMobileSidebar}
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-10 h-10 min-w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <GraduationCap className="w-6 h-6" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-slate-900 leading-tight tracking-tight">
                    SmartLearn
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Học thông minh</span>
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 items-center justify-center transition-colors cursor-pointer"
              title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/student'
                  ? pathname === '/student'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 min-w-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && !isActive && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Student Code Card */}
        <div className="p-3 border-t border-slate-100">
          {!isCollapsed ? (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 min-w-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {user?.fullName?.charAt(0).toUpperCase() || 'H'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.fullName || 'Học sinh'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      @{user?.username}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Student Code Badge */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">Mã học sinh:</span>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 font-mono font-bold text-blue-700 hover:text-blue-800 transition-all cursor-pointer"
                >
                  <span>{user?.studentCode || '------'}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                title={`${user?.fullName} (${user?.studentCode})`}
                className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm"
              >
                {user?.fullName?.charAt(0).toUpperCase() || 'H'}
              </div>
              <button
                onClick={logout}
                title="Đăng xuất"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
