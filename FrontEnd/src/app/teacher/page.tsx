'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { School, LogOut, PlusCircle, Users, BookOpen, Clock } from 'lucide-react';

export default function TeacherDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['GIAO_VIEN']}>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <School className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Unilearn
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Cổng Giáo Viên
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
              <School className="w-3.5 h-3.5" />
              <span>Khu vực quản lý giảng dạy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Xin chào Thầy/Cô, {user?.fullName}!
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
              Hệ thống xác thực tài khoản giáo viên đã sẵn sàng. Thầy/Cô có thể tạo lớp học, mời học sinh bằng mã 6 ký tự, giao bài tập và theo dõi bài nộp trong <strong>Giai đoạn 5 (Module Lớp học)</strong>.
            </p>

            <div className="pt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Quản lý học sinh bằng Mã học sinh</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>Gia hạn bài tập linh hoạt</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
