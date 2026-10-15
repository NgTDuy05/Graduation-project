'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { gamificationService } from '../../services/gamification.service';
import {
  Menu,
  Flame,
  Zap,
  Award,
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  CalendarCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileSidebar,
  title = 'Trang chủ',
}) => {
  const { user, setUser, logout } = useAuth();
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const streakDays = user?.stats?.streakDays || 0;
  const lightningPoints = user?.stats?.lightningPoints || 0;
  const rankTier = user?.stats?.rankTier || 'Đồng';

  const handleCheckIn = async () => {
    if (isCheckinLoading) return;
    setIsCheckinLoading(true);
    setCheckinMessage(null);

    try {
      const result = await gamificationService.checkInToday();
      setCheckinMessage(result.message);

      // Cập nhật lại user stats trong context và localStorage
      if (user) {
        const updatedUser = {
          ...user,
          stats: result.stats,
        };
        setUser(updatedUser);
        localStorage.setItem('smartlearn_user', JSON.stringify(updatedUser));
      }

      setTimeout(() => {
        setCheckinMessage(null);
      }, 4000);
    } catch {
      setCheckinMessage('Điểm danh thất bại. Hãy thử lại!');
    } finally {
      setIsCheckinLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight hidden sm:block">
          {title}
        </h1>
      </div>

      {/* Right: Gamification Badges & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Flame */}
        <div
          title={`Chuỗi học tập: ${streakDays} ngày liên tục`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold shadow-xs hover:bg-amber-100/70 transition-colors"
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span>{streakDays}</span>
          <span className="hidden md:inline font-medium text-[11px] text-amber-600">ngày</span>
        </div>

        {/* Lightning Points */}
        <div
          title={`Điểm tia sét: ${lightningPoints} XP`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-xs hover:bg-blue-100/70 transition-colors"
        >
          <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
          <span>{lightningPoints}</span>
          <span className="hidden md:inline font-medium text-[11px] text-blue-600">XP</span>
        </div>

        {/* Rank Tier */}
        <div
          title={`Hạng: ${rankTier}`}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold shadow-xs"
        >
          <Award className="w-4 h-4 text-purple-600" />
          <span>{rankTier}</span>
        </div>

        {/* Daily Check-in Button */}
        <button
          onClick={handleCheckIn}
          disabled={isCheckinLoading}
          className="relative inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-70"
          title="Điểm danh hôm nay để duy trì streak và nhận điểm sét"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Điểm danh</span>
          <span className="text-[10px] bg-white/20 px-1 rounded-md font-bold">+15 XP</span>
        </button>

        {/* Check-in Message Toast */}
        {checkinMessage && (
          <div className="absolute top-18 right-6 z-50 p-3 rounded-2xl bg-slate-900 text-white text-xs font-medium shadow-xl flex items-center gap-2 animate-bounce-subtle">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{checkinMessage}</span>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-2xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-4 space-y-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Thông báo mới</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100/60 flex items-start gap-2.5 text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Chào mừng bạn gia nhập SmartLearn!</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Khám phá các bài học hay và ôn luyện thẻ ghi nhớ ngay hôm nay nhé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.fullName?.charAt(0).toUpperCase() || 'H'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-2 z-50 space-y-1 animate-fadeIn">
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5 inline-block text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  Mã HS: {user?.studentCode}
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
