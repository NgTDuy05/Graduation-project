'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { HeartHandshake, LogOut, Construction, Sparkles } from 'lucide-react';

export default function ParentDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['PHU_HUYNH']}>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Unilearn
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Phụ huynh
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </header>

        {/* Center Content: Placeholder notification as required */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Construction className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Xin chào {user?.fullName || 'Quý phụ huynh'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Chức năng dành cho phụ huynh đang được phát triển
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Chúng tôi đang hoàn thiện các tính năng theo dõi tiến độ học tập, kết quả bài thi và liên lạc trực tiếp với giáo viên. Xin vui lòng quay lại sau!
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={logout}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-400">
          Unilearn • Nền tảng học thông minh dành cho học sinh từ lớp 6 đến lớp 12
        </footer>
      </div>
    </ProtectedRoute>
  );
}
