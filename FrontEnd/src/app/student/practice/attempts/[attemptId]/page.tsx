'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudentLayout } from '../../../../../components/layout/StudentLayout';
import { practiceService } from '../../../../../services/practice.service';
import { AttemptDetailResponse } from '../../../../../types/practice';
import { MathRenderer } from '../../../../../components/common/MathRenderer';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  Zap,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export default function AttemptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [data, setData] = useState<AttemptDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const res = await practiceService.getAttemptDetail(attemptId);
        if (isMounted) setData(res);
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Không thể tải kết quả bài thi';
          setError(msg);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (attemptId) {
      fetchDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  if (isLoading) {
    return (
      <StudentLayout pageTitle="Đang tải kết quả thi...">
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Đang phân tích bài thi của bạn...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentLayout pageTitle="Lỗi kết quả">
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy bài thi</h2>
          <p className="text-xs text-slate-500">{error || 'Bài thi không tồn tại hoặc bạn không có quyền truy cập.'}</p>
          <Link
            href="/student/practice"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại kho đề thi</span>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const { attempt, analysis } = data;

  // Rating label & color
  let ratingLabel = 'Cần cố gắng';
  let ratingColor = 'text-rose-600 bg-rose-50 border-rose-200';
  let bonusXP = 15;

  if (attempt.score >= 8) {
    ratingLabel = 'Xuất sắc';
    ratingColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    bonusXP = 35;
  } else if (attempt.score >= 5) {
    ratingLabel = 'Đạt yêu cầu';
    ratingColor = 'text-blue-700 bg-blue-50 border-blue-200';
    bonusXP = 25;
  }

  // Filter questions
  const filteredAnalysis = analysis.filter((item) => {
    if (filterMode === 'correct') return item.isCorrect;
    if (filterMode === 'wrong') return !item.isCorrect && item.studentChoice !== null;
    if (filterMode === 'unanswered') return item.studentChoice === null;
    return true;
  });

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins} phút ${remainingSec} giây`;
  };

  return (
    <StudentLayout pageTitle={`Kết quả: ${attempt.examTitle}`}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Top Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/student/practice"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại kho đề thi</span>
          </Link>

          <button
            onClick={() => router.push(`/student/practice/${attempt.examId}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại đề này</span>
          </button>
        </div>

        {/* Score & XP Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phân tích kết quả thi trắc nghiệm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {attempt.examTitle}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100">
              Hoàn thành vào lúc {new Date(attempt.completedAt).toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20">
            <div className="text-center px-4">
              <div className="text-4xl sm:text-5xl font-black tracking-tight">{attempt.score}</div>
              <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-widest mt-1">
                Thang điểm 10
              </div>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="space-y-1">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-black inline-block border ${ratingColor}`}>
                {ratingLabel}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>+{bonusXP} XP Tích lũy</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-bold text-slate-500">Số câu đúng</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {attempt.correctCount}
              <span className="text-xs font-medium text-slate-400">/{attempt.totalQuestions}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              {Math.round((attempt.correctCount / attempt.totalQuestions) * 100)}% chính xác
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-rose-500">
              <span className="text-xs font-bold text-slate-500">Số câu sai</span>
              <XCircle className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">{attempt.wrongCount}</div>
            <div className="text-[11px] text-slate-400">Xem giải thích bên dưới</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-slate-500">Chưa làm</span>
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">{attempt.unansweredCount}</div>
            <div className="text-[11px] text-slate-400">Bỏ qua trong lúc làm</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-teal-600">
              <span className="text-xs font-bold text-slate-500">Thời gian làm</span>
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {formatSeconds(attempt.durationSeconds)}
            </div>
            <div className="text-[11px] text-slate-400">Tốc độ hoàn thành bài</div>
          </div>
        </div>

        {/* Detailed Question Review Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Phân tích chi tiết câu hỏi & Lời giải</span>
              </h2>
              <p className="text-xs text-slate-500">
                Đối chiếu câu trả lời của bạn với đáp án chuẩn và lời giải phương pháp
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tất cả ({analysis.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('correct')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'correct'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                Đúng ({attempt.correctCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('wrong')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'wrong'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-rose-700'
                }`}
              >
                Sai ({attempt.wrongCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unanswered')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'unanswered'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Chưa làm ({attempt.unansweredCount})
              </button>
            </div>
          </div>

          {/* List of Questions */}
          <div className="space-y-5">
            {filteredAnalysis.map((item, idx) => {
              const isCorrect = item.isCorrect;
              const isUnanswered = item.studentChoice === null;

              return (
                <div
                  key={item.questionId}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5"
                >
                  {/* Question Title & Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        <MathRenderer content={item.question} />
                      </h3>
                    </div>

                    {/* Result Badge */}
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Chính xác</span>
                        </span>
                      ) : isUnanswered ? (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 flex items-center gap-1.5">
                          <span>Chưa trả lời</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Sai</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {item.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isStudentPick = item.studentChoice === optIdx;
                      const isRightAnswer = item.correctIndex === optIdx;

                      let style = 'bg-slate-50/70 border-slate-200 text-slate-700';
                      let badge = null;

                      if (isRightAnswer) {
                        style = 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                        badge = (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            Đáp án đúng
                          </span>
                        );
                      }

                      if (isStudentPick && !isRightAnswer) {
                        style = 'bg-rose-50/80 border-rose-400 text-rose-950 font-semibold ring-1 ring-rose-400';
                        badge = (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                            Bạn đã chọn
                          </span>
                        );
                      }

                      if (isStudentPick && isRightAnswer) {
                        badge = (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Lựa chọn của bạn ✓
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${style}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-white/80 border border-slate-200 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {letter}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm leading-relaxed">
                              <MathRenderer content={opt} />
                            </div>
                            {badge && <div className="mt-1.5">{badge}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pedagogical Explanation Card */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lời giải chi tiết & Phương pháp:</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-5">
                      {item.explanation ? (
                        <MathRenderer content={item.explanation} />
                      ) : (
                        'Không có lời giải chi tiết cho câu hỏi này.'
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
