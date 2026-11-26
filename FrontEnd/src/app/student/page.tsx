'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { StudentLayout } from '../../components/layout/StudentLayout';
import {
  gamificationService,
  DailyQuest,
  LeaderboardItem,
} from '../../services/gamification.service';
import {
  Sparkles,
  BookOpen,
  Layers,
  School,
  FileCheck2,
  Target,
  Bot,
  Flame,
  Zap,
  Award,
  ArrowRight,
  CheckCircle2,
  Circle,
  Trophy,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function StudentHomePage() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);

  // Lời chào theo buổi trong ngày
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questData, leaderboardData] = await Promise.all([
          gamificationService.getDailyQuests(),
          gamificationService.getLeaderboard(5),
        ]);
        setQuests(questData.quests);
        setLeaderboard(leaderboardData);
      } catch {
        // Fallback placeholder data if backend isn't populated yet
      } finally {
        setIsLoadingQuests(false);
      }
    };

    fetchData();
  }, [user]);

  // 6 Thẻ chức năng điều hướng chính
  const mainCards = [
    {
      id: 'study',
      title: 'Học bài theo môn',
      description: 'Lý thuyết trọng tâm, video bài giảng trực quan từ Lớp 6 đến Lớp 12',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50 text-blue-700',
      badge: 'Lớp 6 - 12',
      href: '/student/study',
    },
    {
      id: 'flashcards',
      title: 'Thẻ ghi nhớ (Flashcard)',
      description: 'Ghi nhớ định nghĩa, từ vựng và công thức toán lý hóa với minigame lật thẻ',
      icon: Layers,
      color: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50 text-amber-700',
      badge: 'Học siêu tốc',
      href: '/student/study?tab=flashcards',
    },
    {
      id: 'classes',
      title: 'Lớp học trực tuyến',
      description: 'Tham gia lớp của Thầy Cô, xem danh sách bạn bè và nhận thông báo mới',
      icon: School,
      color: 'from-indigo-500 to-purple-600',
      lightBg: 'bg-indigo-50 text-indigo-700',
      badge: 'Tương tác',
      href: '/student/classes',
    },
    {
      id: 'assignments',
      title: 'Bài tập được giao',
      description: 'Theo dõi hạn chót nộp bài, nộp bài trực tuyến và xem nhận xét điểm số',
      icon: FileCheck2,
      color: 'from-rose-500 to-pink-600',
      lightBg: 'bg-rose-50 text-rose-700',
      badge: 'Cần chú ý',
      href: '/student/classes?tab=assignments',
    },
    {
      id: 'practice',
      title: 'Luyện đề trắc nghiệm',
      description: 'Kho đề thi phong phú, làm bài thi có bấm giờ và phân tích lỗi sai chi tiết',
      icon: Target,
      color: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50 text-emerald-700',
      badge: 'Thi thử',
      href: '/student/practice',
    },
    {
      id: 'ai-tutor',
      title: 'Gia sư thông minh',
      description: 'Hỏi đáp phương pháp giải bài tập và gợi ý học tập cá nhân hóa 24/7',
      icon: Bot,
      color: 'from-cyan-500 to-blue-600',
      lightBg: 'bg-cyan-50 text-cyan-700',
      badge: 'AI Tutor',
      href: '/student/study?tutor=open',
    },
  ];

  const completedQuestsCount = quests.filter((q) => q.isCompleted).length;
  const questProgressPercent = quests.length > 0 ? (completedQuestsCount / quests.length) * 100 : 0;

  return (
    <StudentLayout pageTitle="Trang chủ học tập">
      <div className="space-y-8 animate-fadeIn">
        {/* 1. HERO BANNER CHÀO MỪNG */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-blue-600/15">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>SmartLearn • Học thông minh - Vươn tầm tri thức</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {getGreeting()}, <span className="text-amber-300">{user?.fullName || 'Học sinh'}</span>! 👋
            </h1>

            <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl">
              Hôm nay là một ngày tuyệt vời để tiếp thu thêm kiến thức mới. Hãy duy trì chuỗi học <strong>{user?.stats?.streakDays || 0} ngày</strong> và tích lũy thêm điểm tia sét nhé!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/student/study"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Bắt đầu học ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/student/practice"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Luyện đề thi thử</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. 6 CARDS ĐIỀU HƯỚNG CHÍNH */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Không gian học tập
              </h2>
              <p className="text-xs text-slate-500">
                Chọn chức năng để bắt đầu buổi học hiệu quả
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mainCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className="group relative bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${card.lightBg}`}>
                        {card.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                    <span>Khám phá ngay</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 3. NHIỆM VỤ HÀNG NGÀY & BẢNG XẾP HẠNG (2 COLUMNS) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột Trái: Nhiệm vụ hàng ngày (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="font-bold text-lg text-slate-900">Nhiệm vụ hôm nay</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hoàn thành nhiệm vụ để duy trì streak và tích lũy XP
                </p>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">
                  {completedQuestsCount}/{quests.length || 4} hoàn thành
                </span>
                <div className="w-24 sm:w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${questProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quests List */}
            <div className="space-y-3">
              {isLoadingQuests ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Đang tải nhiệm vụ hàng ngày...
                </div>
              ) : (
                quests.map((quest) => (
                  <div
                    key={quest.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${quest.isCompleted
                        ? 'bg-emerald-50/50 border-emerald-200/60'
                        : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5">
                        {quest.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${quest.isCompleted ? 'text-emerald-900 line-through' : 'text-slate-900'
                            }`}
                        >
                          {quest.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{quest.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-100/70 text-blue-700">
                        <Zap className="w-3.5 h-3.5 fill-blue-600" />
                        <span>+{quest.rewardPoints} XP</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cột Phải: Bảng xếp hạng Tuần Preview (1 col) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-lg text-slate-900">Top học viên</h3>
                </div>
                <Link
                  href="/student/leaderboard"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Leaderboard list */}
              <div className="space-y-2.5">
                {leaderboard.length > 0 ? (
                  leaderboard.slice(0, 5).map((item, index) => {
                    const isCurrentUser = item.userId === user?.id;
                    const rankMedal =
                      index === 0
                        ? '🥇'
                        : index === 1
                          ? '🥈'
                          : index === 2
                            ? '🥉'
                            : `#${index + 1}`;

                    return (
                      <div
                        key={item.userId}
                        className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors ${isCurrentUser
                            ? 'bg-blue-50 border border-blue-200/80 shadow-xs'
                            : 'hover:bg-slate-50 border border-transparent'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 text-center font-bold text-sm text-slate-700">
                            {rankMedal}
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {item.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {item.fullName}
                              {isCurrentUser && (
                                <span className="ml-1 text-[10px] text-blue-600 font-semibold">
                                  (Bạn)
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {item.streakDays} ngày streak 🔥
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-black text-blue-600 flex-shrink-0">
                          <Zap className="w-3.5 h-3.5 fill-blue-600" />
                          <span>{item.lightningPoints} XP</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Chưa có dữ liệu thi đua tuần này.
                  </div>
                )}
              </div>
            </div>

            {/* My Rank Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-700">Điểm của bạn:</span>
              </div>
              <div className="font-bold text-blue-700">
                {user?.stats?.lightningPoints || 0} XP • Hạng {user?.stats?.rankTier || 'Đồng'}
              </div>
            </div>
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
