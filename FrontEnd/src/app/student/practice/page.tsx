'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { practiceService } from '../../../services/practice.service';
import { Exam, ExamAttempt } from '../../../types/practice';
import {
  Target,
  Clock,
  FileText,
  Play,
  Trophy,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Settings2,
  Flame,
  Zap,
} from 'lucide-react';

export default function PracticeCatalogPage() {
  const router = useRouter();

  const [exams, setExams] = useState<Exam[]>([]);
  const [history, setHistory] = useState<ExamAttempt[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [isLoading, setIsLoading] = useState(true);

  // Setup Modal
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isTimed, setIsTimed] = useState<boolean>(true);

  const grades = [
    { label: 'Tất cả khối lớp', value: null },
    { label: 'Lớp 12', value: 12 },
    { label: 'Lớp 10', value: 10 },
    { label: 'Lớp 9', value: 9 },
    { label: 'Lớp 6', value: 6 },
  ];

  const subjects = ['Tất cả', 'Toán', 'Tiếng Anh', 'Vật lý', 'Hóa học'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [examsData, historyData] = await Promise.all([
          practiceService.getExams(selectedGrade || undefined, selectedSubject),
          practiceService.getAttemptsHistory(),
        ]);
        setExams(examsData);
        setHistory(historyData);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedGrade, selectedSubject]);

  const handleStartExam = () => {
    if (!selectedExam) return;
    router.push(`/student/practice/${selectedExam.examId}?timed=${isTimed ? '1' : '0'}`);
  };

  return (
    <StudentLayout pageTitle="Ôn luyện & Luyện đề">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đấu trường & Ngân hàng đề thi trắc nghiệm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Luyện Đề Thi Trắc Nghiệm Thông Minh
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Trải nghiệm phòng thi thực tế với đồng hồ bấm giờ đếm ngược, tự động chấm điểm và xem lời giải phân tích lỗi sai chi tiết.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <div className="text-2xl font-black">{history.length}</div>
              <div className="text-[10px] uppercase font-bold text-emerald-200">Đề đã làm</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Kho đề vs Lịch sử */}
        <div className="flex border-b border-slate-200/80 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Kho đề thi ({exams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Lịch sử bài thi ({history.length})</span>
          </button>
        </div>

        {/* Tab 1: Kho Đề Thi */}
        {activeTab === 'catalog' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Filter Bar */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Grade selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1 pl-1 flex-shrink-0">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Khối:</span>
                </span>
                {grades.map((g) => (
                  <button
                    key={g.label}
                    onClick={() => setSelectedGrade(g.value)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedGrade === g.value
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Subject selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSubject === sub
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Exams Grid */}
            {isLoading ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Đang tải danh sách đề thi...
              </div>
            ) : exams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => (
                  <div
                    key={exam.examId}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                          Lớp {exam.grade} • {exam.subject}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{exam.durationMinutes} phút</span>
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-bold text-base text-slate-900 line-clamp-2">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {exam.description || 'Đề thi trắc nghiệm chuẩn kiến thức SGK.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{exam.totalQuestions} câu hỏi</span>
                        </span>
                        <span className="text-emerald-600 font-semibold">+35 XP</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedExam(exam)}
                        className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Vào thi ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                <Target className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800">Không tìm thấy đề thi phù hợp</h3>
                <p className="text-xs text-slate-500">Hãy thử đổi bộ lọc khối lớp hoặc môn học nhé.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Lịch Sử Thi */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden animate-fadeIn">
            {history.length > 0 ? (
              history.map((att) => (
                <div
                  key={att._id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">
                      {att.examTitle}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(att.completedAt).toLocaleString('vi-VN')}</span>
                      </span>
                      <span>•</span>
                      <span>Thời gian: {Math.floor(att.durationSeconds / 60)}p {att.durationSeconds % 60}s</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">{att.correctCount}/{att.totalQuestions} câu đúng</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">
                        {att.score}/10
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600">
                        {att.score >= 8 ? 'Xuất sắc' : att.score >= 5 ? 'Đạt' : 'Cần cố gắng'}
                      </div>
                    </div>

                    <Link
                      href={`/student/practice/attempts/${att._id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Xem lại bài
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 p-8 space-y-2">
                <Trophy className="w-10 h-10 mx-auto text-slate-300" />
                <p>Bạn chưa làm đề thi nào.</p>
                <p className="text-[11px]">Hãy chọn một đề thi trong kho để bắt đầu luyện tập nhé!</p>
              </div>
            )}
          </div>
        )}

        {/* MODAL CÀI ĐẶT PHÒNG THI */}
        {selectedExam && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base text-slate-900">Cấu hình phòng thi</h3>
                </div>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">{selectedExam.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Khối {selectedExam.grade}</span>
                  <span>•</span>
                  <span>Môn {selectedExam.subject}</span>
                  <span>•</span>
                  <span>{selectedExam.totalQuestions} câu</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Chế độ làm bài:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTimed(true)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isTimed
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Clock className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs block font-bold">Tính giờ thi</span>
                    <span className="text-[10px] text-slate-400">{selectedExam.durationMinutes} phút</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTimed(false)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      !isTimed
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Target className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs block font-bold">Tự do</span>
                    <span className="text-[10px] text-slate-400">Không giới hạn</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartExam}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Bắt đầu làm bài thi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
