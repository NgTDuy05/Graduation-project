'use client';

import React, { useState, useEffect } from 'react';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { gamificationService, LeaderboardItem } from '../../../services/gamification.service';
import { Trophy, Zap, Flame, Award, ShieldAlert, Sparkles } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await gamificationService.getLeaderboard(20);
        setLeaderboard(data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <StudentLayout pageTitle="Bảng xếp hạng & Thi đua">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-amber-500/15 flex items-center justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đua Top Nhận Thưởng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bảng Vàng Thi Đua Unilearn
            </h1>
            <p className="text-sm text-amber-100 max-w-xl leading-relaxed">
              Tích lũy điểm tia sét thông qua học bài, luyện thẻ flashcard, làm đề kiểm tra và duy trì chuỗi streak hàng ngày để thăng hạng!
            </p>
          </div>
          <div className="hidden md:flex w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md items-center justify-center text-4xl shadow-inner">
            🏆
          </div>
        </div>

        {/* Leaderboard Table Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Top 20 học sinh xuất sắc nhất tuần
            </h2>
            <div className="text-xs font-semibold text-slate-500">
              Cập nhật trực tiếp theo thời gian thực
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Đang tải bảng xếp hạng...
              </div>
            ) : leaderboard.length > 0 ? (
              leaderboard.map((item, index) => {
                const isCurrentUser = item.userId === user?.id;
                const rankBadge =
                  index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

                return (
                  <div
                    key={item.userId}
                    className={`py-3.5 px-4 rounded-2xl flex items-center justify-between gap-4 transition-colors ${
                      isCurrentUser ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-8 text-center font-extrabold text-base text-slate-800">
                        {rankBadge}
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                        {item.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {item.fullName}{' '}
                          {isCurrentUser && (
                            <span className="text-xs text-blue-600 font-semibold">(Bạn)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">
                          Mã HS: {item.studentCode || 'N/A'} • Hạng {item.rankTier}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{item.streakDays} ngày</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                        <Zap className="w-4 h-4 fill-blue-600" />
                        <span>{item.lightningPoints} XP</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Chưa có dữ liệu học viên thi đua.
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
