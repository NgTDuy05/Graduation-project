'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import {
  parentService,
  LinkedChildSummary,
  ChildOverviewResponse,
} from '../../services/parent.service';
import { subscriptionService, PlanType } from '../../services/subscription.service';
import { SubscriptionModal } from '../../components/subscription/SubscriptionModal';
import {
  HeartHandshake,
  LogOut,
  UserPlus,
  Flame,
  Zap,
  Award,
  BookOpen,
  FileCheck2,
  Target,
  Bell,
  School,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pin,
  Crown,
  Trash2,
  Sparkles,
  Loader2,
  Layers,
  X,
} from 'lucide-react';

export default function ParentDashboardPage() {
  const { user, logout } = useAuth();

  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [overview, setOverview] = useState<ChildOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'assignments' | 'exams' | 'announcements'
  >('overview');

  // Link child modal / form
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [relationshipInput, setRelationshipInput] = useState('Bố');
  const [linkStatus, setLinkStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  // Subscription state
  const [planType, setPlanType] = useState<PlanType>('FREE');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const fetchChildren = async (preferredId?: number) => {
    setIsLoading(true);
    try {
      const list = await parentService.getLinkedChildren();
      setChildren(list);
      const targetId =
        preferredId && list.some((c) => c.student.id === preferredId)
          ? preferredId
          : list[0]?.student.id || null;
      setSelectedStudentId(targetId);
      if (targetId) {
        await fetchOverview(targetId);
      } else {
        setOverview(null);
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOverview = async (studentId: number) => {
    setIsLoadingOverview(true);
    try {
      const data = await parentService.getChildOverview(studentId);
      setOverview(data);
    } catch {
      setOverview(null);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    subscriptionService
      .getMySubscription()
      .then((res) => setPlanType(res.current.planType))
      .catch(() => {});
  }, []);

  const handleSelectChild = (studentId: number) => {
    setSelectedStudentId(studentId);
    fetchOverview(studentId);
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCodeInput.trim()) return;

    setIsLinking(true);
    setLinkStatus(null);
    try {
      const res = await parentService.linkChild(
        studentCodeInput.trim().toUpperCase(),
        relationshipInput,
      );
      setLinkStatus({ type: 'success', text: res.message });
      setStudentCodeInput('');
      await fetchChildren();
      setTimeout(() => {
        setIsLinkModalOpen(false);
        setLinkStatus(null);
      }, 1400);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setLinkStatus({
        type: 'error',
        text:
          error.response?.data?.message ||
          'Không tìm thấy học sinh với mã này. Vui lòng kiểm tra lại!',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkChild = async (studentId: number, fullName: string) => {
    if (!confirm(`Bạn có chắc muốn hủy theo dõi học sinh "${fullName}"?`)) return;
    try {
      await parentService.unlinkChild(studentId);
      await fetchChildren();
    } catch {
      //
    }
  };

  return (
    <ProtectedRoute allowedRoles={['PHU_HUYNH']}>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                SmartLearn
              </span>
              <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Cổng Phụ Huynh
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {children.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="child-select" className="sr-only">
                  Chọn học sinh
                </label>
                <select
                  id="child-select"
                  value={selectedStudentId || ''}
                  onChange={(e) => handleSelectChild(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {children.map((c) => (
                    <option key={c.student.id} value={c.student.id}>
                      {c.student.fullName} ({c.student.studentCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setLinkStatus(null);
                setIsLinkModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Liên kết con</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSubModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                planType === 'PRO'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Gói {planType}</span>
            </button>

            <span className="text-xs font-bold text-slate-700 hidden md:inline">
              {user?.fullName}
            </span>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {isLoading ? (
            <div className="py-24 flex items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Đang tải dữ liệu theo dõi học tập...</span>
            </div>
          ) : children.length === 0 ? (
            /* Empty Onboarding State: Link Child by 6-char Student Code */
            <div className="max-w-lg mx-auto my-8 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <HeartHandshake className="w-8 h-8" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Liên kết tài khoản Học sinh
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Nhập <strong>Mã học sinh 6 ký tự</strong> (hiển thị trong tài khoản của con) để bắt đầu theo dõi tiến độ học tập, bài tập và kết quả thi cử theo thời gian thực.
                </p>
              </div>

              {linkStatus && (
                <div
                  role="status"
                  className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    linkStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}
                >
                  {linkStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{linkStatus.text}</span>
                </div>
              )}

              <form onSubmit={handleLinkChild} className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="empty-student-code"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Mã học sinh (6 ký tự)
                  </label>
                  <input
                    id="empty-student-code"
                    type="text"
                    required
                    maxLength={6}
                    value={studentCodeInput}
                    onChange={(e) => setStudentCodeInput(e.target.value.toUpperCase())}
                    placeholder="VD: HS2026"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-mono font-black tracking-widest text-center uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="empty-relationship"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Mối quan hệ
                  </label>
                  <select
                    id="empty-relationship"
                    value={relationshipInput}
                    onChange={(e) => setRelationshipInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm"
                  >
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Người giám hộ">Người giám hộ</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLinking || studentCodeInput.length !== 6}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLinking ? 'Đang kiểm tra...' : 'Liên kết theo dõi ngay'}
                </button>
              </form>
            </div>
          ) : isLoadingOverview || !overview ? (
            <div className="py-20 flex items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Đang tổng hợp báo cáo học tập của con...</span>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Student Profile Hero Banner */}
              <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/15 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md text-white font-black text-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                    {overview.student.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                        {overview.relationship} của học sinh
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 font-mono text-xs font-bold">
                        Mã HS: {overview.student.studentCode}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/90 text-slate-900 text-xs font-extrabold">
                        Gói {overview.student.planType}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {overview.student.fullName}
                    </h1>
                    <p className="text-xs sm:text-sm text-emerald-100">
                      @{overview.student.username} • {overview.student.email}
                    </p>
                  </div>
                </div>

                {/* Gamification & Unlink */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
                    <div>
                      <div className="text-base font-black leading-none">
                        {overview.student.stats.streakDays} ngày
                      </div>
                      <div className="text-[10px] text-emerald-100 mt-0.5">Chuỗi học</div>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    <div>
                      <div className="text-base font-black leading-none">
                        {overview.student.stats.lightningPoints} XP
                      </div>
                      <div className="text-[10px] text-emerald-100 mt-0.5">Điểm tia sét</div>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-200" />
                    <div>
                      <div className="text-base font-black leading-none">
                        {overview.student.stats.rankTier}
                      </div>
                      <div className="text-[10px] text-emerald-100 mt-0.5">Xếp hạng</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleUnlinkChild(overview.student.id, overview.student.fullName)
                    }
                    title="Hủy liên kết học sinh này"
                    className="p-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/80 border border-white/20 text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </section>

              {/* 4 KPI Cards */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Điểm trung bình</span>
                    <Target className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {overview.summary.averageScore !== null
                      ? `${overview.summary.averageScore}/10`
                      : 'Chưa có'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tính trên bài tập đã chấm & đề thi thử
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Bài tập trên lớp</span>
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {overview.summary.submittedAssignments}/{overview.summary.totalAssignments}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {overview.summary.overdueAssignments > 0 ? (
                      <span className="text-rose-600 font-bold">
                        {overview.summary.overdueAssignments} bài quá hạn chưa nộp
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">
                        Không có bài quá hạn
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Tự học bài giảng</span>
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {overview.summary.completedLessons} bài
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Đã thuộc {overview.summary.totalFlashcardsLearned} thẻ ghi nhớ
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Luyện đề trắc nghiệm</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {overview.summary.totalExamsTaken} lượt thi
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tham gia {overview.summary.totalClasses} lớp học
                  </p>
                </div>
              </section>

              {/* Sub-tabs */}
              <div className="flex flex-wrap border-b border-slate-200 gap-6 text-xs sm:text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lớp học & Tiến độ tự học</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('assignments')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'assignments'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Bài tập & Điểm trên lớp ({overview.assignments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('exams')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'exams'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Kết quả thi thử ({overview.examAttempts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('announcements')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'announcements'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Thông báo từ Giáo viên ({overview.announcements.length})</span>
                </button>
              </div>

              {/* TAB 1: OVERVIEW & STUDY PROGRESS */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Enrolled Classes */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <School className="w-4 h-4 text-emerald-600" />
                      <span>Lớp học đang tham gia</span>
                    </h2>
                    {overview.classes.length > 0 ? (
                      <div className="space-y-3">
                        {overview.classes.map((cls) => (
                          <div
                            key={cls.id}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-900">
                                {cls.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                Lớp {cls.grade}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Môn: {cls.subject} • GV: <strong>{cls.teacherName}</strong>
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Học sinh chưa tham gia lớp học nào.</p>
                    )}
                  </div>

                  {/* Study Progress Details */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Chi tiết tiến độ tự học bài giảng</span>
                    </h2>
                    {overview.studyProgress.length > 0 ? (
                      <div className="space-y-3">
                        {overview.studyProgress.map((item) => (
                          <div
                            key={item.lessonId}
                            className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-blue-600">
                                {item.courseTitle}
                              </span>
                              <h3 className="font-bold text-sm text-slate-900">
                                Bài: {item.lessonId}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span
                                  className={
                                    item.completedTheory
                                      ? 'text-emerald-600 font-semibold'
                                      : 'text-slate-400'
                                  }
                                >
                                  {item.completedTheory
                                    ? '✓ Đã hoàn thành lý thuyết'
                                    : '○ Chưa xong lý thuyết'}
                                </span>
                                <span>•</span>
                                <span>{item.learnedFlashcardsCount} flashcards đã thuộc</span>
                                {item.wrongQuestionsCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-rose-600 font-semibold">
                                      {item.wrongQuestionsCount} câu sai cần ôn
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-indigo-700">
                                Củng cố: {item.practiceScore}/10
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-xs text-slate-400">
                        Con chưa có lịch sử học bài giảng tự học trên hệ thống.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ASSIGNMENTS */}
              {activeTab === 'assignments' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {overview.assignments.length > 0 ? (
                    overview.assignments.map((asg) => {
                      const isOverdue =
                        asg.status === 'CHUA_LAM' &&
                        new Date(asg.deadline) < new Date();
                      return (
                        <div
                          key={asg.id}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50"
                        >
                          <div className="space-y-1.5 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {asg.className}
                              </span>
                              {asg.status === 'DA_NOP' && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                  Đã nộp đúng hạn
                                </span>
                              )}
                              {asg.status === 'QUA_HAN' && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700">
                                  Nộp muộn
                                </span>
                              )}
                              {asg.status === 'CHUA_LAM' && (
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                    isOverdue
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {isOverdue ? 'Quá hạn chưa nộp' : 'Chưa nộp'}
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-sm sm:text-base text-slate-900">
                              {asg.title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                Hạn chót: {new Date(asg.deadline).toLocaleString('vi-VN')}
                              </span>
                            </div>

                            {asg.feedback && (
                              <p className="text-xs text-slate-600 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
                                <strong>Nhận xét của Giáo viên:</strong> &ldquo;{asg.feedback}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            {asg.score !== null ? (
                              <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-black">
                                {asg.score}/10 điểm
                              </div>
                            ) : (
                              <div className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-500 text-xs font-semibold">
                                Chưa chấm điểm
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-10 text-center text-xs text-slate-400">
                      Chưa có bài tập nào được giao.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXAMS */}
              {activeTab === 'exams' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {overview.examAttempts.length > 0 ? (
                    overview.examAttempts.map((att) => (
                      <div
                        key={att._id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">
                            {att.examTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="text-emerald-600 font-semibold">
                              Đúng: {att.correctCount}/{att.totalQuestions} câu
                            </span>
                            <span>•</span>
                            <span className="text-rose-600">Sai: {att.wrongCount}</span>
                            <span>•</span>
                            <span>
                              Thời gian: {Math.floor(att.durationSeconds / 60)}p{' '}
                              {att.durationSeconds % 60}s
                            </span>
                            <span>•</span>
                            <span>
                              Ngày thi: {new Date(att.completedAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`px-4 py-2 rounded-2xl text-sm font-black flex-shrink-0 ${
                            att.score >= 8
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : att.score >= 5
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {att.score}/10 điểm
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-xs text-slate-400">
                      Học sinh chưa thực hiện bài thi thử nào.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ANNOUNCEMENTS */}
              {activeTab === 'announcements' && (
                <div className="space-y-3">
                  {overview.announcements.length > 0 ? (
                    overview.announcements.map((ann) => (
                      <div
                        key={ann._id}
                        className={`p-5 rounded-3xl border ${
                          ann.isPinned
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-white border-slate-200/80'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            {ann.isPinned && (
                              <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {ann.className}
                            </span>
                            <h3 className="font-bold text-sm text-slate-900">{ann.title}</h3>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {ann.createdAt
                              ? new Date(ann.createdAt).toLocaleDateString('vi-VN')
                              : ''}
                          </span>
                        </div>
                        <p className="mt-2.5 text-xs sm:text-sm text-slate-700 whitespace-pre-line">
                          {ann.content}
                        </p>
                        <p className="mt-3 text-[11px] text-slate-400">
                          Người đăng: <strong>{ann.authorName}</strong>
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center bg-white rounded-3xl border border-slate-200/80 text-xs text-slate-400">
                      Chưa có thông báo nào từ giáo viên các lớp của con.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* MODAL: LIÊN KẾT THÊM CON */}
        {isLinkModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  Liên kết tài khoản Học sinh
                </h3>
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {linkStatus && (
                <div
                  role="status"
                  className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    linkStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}
                >
                  {linkStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{linkStatus.text}</span>
                </div>
              )}

              <form onSubmit={handleLinkChild} className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="modal-student-code"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Mã học sinh (6 ký tự in hoa)
                  </label>
                  <input
                    id="modal-student-code"
                    type="text"
                    required
                    maxLength={6}
                    value={studentCodeInput}
                    onChange={(e) => setStudentCodeInput(e.target.value.toUpperCase())}
                    placeholder="VD: HS2026"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-mono font-bold tracking-widest text-center uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="modal-relationship"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Mối quan hệ
                  </label>
                  <select
                    id="modal-relationship"
                    value={relationshipInput}
                    onChange={(e) => setRelationshipInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm"
                  >
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Người giám hộ">Người giám hộ</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLinking || studentCodeInput.length !== 6}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLinking ? 'Đang kiểm tra...' : 'Xác nhận liên kết'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SUBSCRIPTIONS */}
        <SubscriptionModal
          isOpen={isSubModalOpen}
          onClose={() => setIsSubModalOpen(false)}
          onUpdated={(newPlan) => setPlanType(newPlan)}
        />

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-400">
          SmartLearn • Đồng hành cùng phụ huynh và học sinh từ lớp 6 đến lớp 12
        </footer>
      </div>
    </ProtectedRoute>
  );
}
