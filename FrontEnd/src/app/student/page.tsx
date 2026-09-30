'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import {
  GraduationCap,
  Sparkles,
  Zap,
  Flame,
  Award,
  Copy,
  Check,
  LogOut,
  BookOpen,
  Users,
  Compass,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyStudentCode = () => {
    if (user?.studentCode) {
      navigator.clipboard.writeText(user.studentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['HOC_SINH']}>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Unilearn
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Học sinh
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Gamification Badges */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-2xl text-amber-700 text-xs font-bold shadow-xs">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{user?.stats?.streakDays || 0} Ngày</span>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3 py-1.5 rounded-2xl text-blue-700 text-xs font-bold shadow-xs">
              <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span>{user?.stats?.lightningPoints || 0} Điểm</span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chào mừng bạn đến với Unilearn</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Xin chào, {user?.fullName}!
              </h1>
              <p className="text-sm text-blue-100 max-w-xl">
                Tài khoản học sinh của bạn đã được thiết lập thành công. Hãy bắt đầu ôn tập bài giảng, luyện thẻ flashcard hoặc tham gia lớp học ngay nhé.
              </p>
            </div>

            {/* Student Code Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl flex flex-col items-center text-center min-w-[200px] shadow-inner">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">
                Mã học sinh của bạn
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest my-1 select-all">
                {user?.studentCode || '------'}
              </span>
              <button
                onClick={copyStudentCode}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white text-blue-700 text-xs font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã chép mã!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Chuỗi ngày học</div>
                <div className="text-xl font-bold text-slate-900">
                  {user?.stats?.streakDays || 0} ngày liên tục
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Điểm tia sét</div>
                <div className="text-xl font-bold text-slate-900">
                  {user?.stats?.lightningPoints || 0} XP
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Hạng học viên</div>
                <div className="text-xl font-bold text-slate-900">
                  Hạng {user?.stats?.rankTier || 'Đồng'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice for Next Phase */}
          <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-100 text-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Compass className="w-4 h-4" />
              <span>Tiến trình dự án: Đã hoàn tất Giai đoạn 2 (Xác thực & Mã học sinh)</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Các tính năng chi tiết về giao diện trang chủ học sinh (Sidebar thu gọn, Topbar, 6 cards điều hướng, nhiệm vụ hàng ngày và BXH) sẽ được phát triển đầy đủ tại <strong>Giai đoạn 3</strong>.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
