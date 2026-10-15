'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StudentLayout } from '../../../../components/layout/StudentLayout';
import { practiceService } from '../../../../services/practice.service';
import { Exam, ExamQuestion } from '../../../../types/practice';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Flag,
  Sparkles,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export default function ExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const examId = params.examId as string;
  const isTimed = searchParams.get('timed') !== '0';

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Exam state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [autoSubmitted, setAutoSubmitted] = useState<boolean>(false);

  const initialDurationRef = useRef<number>(0);
  const answersRef = useRef<Record<string, number>>({});
  const elapsedTimeRef = useRef<number>(0);

  // Keep refs up-to-date for timers
  answersRef.current = answers;
  elapsedTimeRef.current = elapsedTime;

  // 1. Load exam
  useEffect(() => {
    let isMounted = true;
    const loadExam = async () => {
      try {
        setIsLoading(true);
        const data = await practiceService.getExamById(examId);
        if (!isMounted) return;
        setExam(data);

        const totalSecs = (data.durationMinutes || 45) * 60;
        initialDurationRef.current = totalSecs;
        setTimeLeft(totalSecs);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Không thể tải đề thi';
        setError(msg);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (examId) {
      loadExam();
    }
    return () => {
      isMounted = false;
    };
  }, [examId]);

  // Submit Handler
  const executeSubmit = useCallback(
    async (isAuto = false) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      if (isAuto) setAutoSubmitted(true);

      try {
        const finalDuration = isTimed
          ? initialDurationRef.current - timeLeft
          : elapsedTimeRef.current;

        const res = await practiceService.submitExam(
          examId,
          answersRef.current,
          Math.max(1, finalDuration),
        );

        router.push(`/student/practice/attempts/${res.attemptId}`);
      } catch {
        setError('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
        setIsSubmitting(false);
      }
    },
    [examId, isSubmitting, isTimed, timeLeft, router],
  );

  // 2. Countdown Timer
  useEffect(() => {
    if (!exam || isSubmitting) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);

      if (isTimed) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            executeSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, isTimed, isSubmitting, executeSubmit]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Answer handler
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Flag toggle
  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (isLoading) {
    return (
      <StudentLayout pageTitle="Đang vào phòng thi...">
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Đang chuẩn bị đề thi cho bạn...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error || !exam) {
    return (
      <StudentLayout pageTitle="Lỗi phòng thi">
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy đề thi</h2>
          <p className="text-xs text-slate-500">{error || 'Đề thi không tồn tại hoặc đã bị xóa.'}</p>
          <Link
            href="/student/practice"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về danh sách đề thi</span>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const currentQ: ExamQuestion = exam.questions[currentIndex] || exam.questions[0];
  const totalQuestions = exam.questions.length;
  const answeredCount = Object.keys(answers).length;
  const isTimeCritical = isTimed && timeLeft < 300; // under 5 mins

  return (
    <StudentLayout pageTitle={`Phòng thi: ${exam.title}`}>
      <div className="space-y-6">
        {/* Sticky Exam Status Header */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-30 backdrop-blur-md bg-white/95">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                Lớp {exam.grade} • {exam.subject}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {totalQuestions} câu hỏi trắc nghiệm
              </span>
            </div>
            <h1 className="font-extrabold text-base sm:text-lg text-slate-900 line-clamp-1">
              {exam.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            {/* Timer Badge */}
            <div
              className={`px-4 py-2 rounded-2xl font-mono text-sm sm:text-base font-black flex items-center gap-2 border transition-all ${isTimed
                  ? isTimeCritical
                    ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isTimed ? formatTime(timeLeft) : formatTime(elapsedTime)}</span>
            </div>

            {/* Quick Submit Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài ({answeredCount}/{totalQuestions})</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Question Content & Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Question Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Câu hỏi {currentIndex + 1} / {totalQuestions}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${flagged[currentQ.id]
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{flagged[currentQ.id] ? 'Đã đánh dấu' : 'Đánh dấu câu này'}</span>
                </button>
              </div>

              {/* Question Body */}
              <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                {currentQ.question}
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  const isSelected = answers[currentQ.id] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all duration-200 cursor-pointer ${isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                          }`}
                      >
                        {letter}
                      </span>
                      <span
                        className={`text-sm sm:text-base leading-relaxed flex-1 ${isSelected ? 'font-bold text-emerald-950' : 'text-slate-800'
                          }`}
                      >
                        {opt}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Question Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Câu tiếp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Xem xét & Nộp bài</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Question Palette (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5 sticky top-36">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Mục lục câu hỏi</h3>
                <span className="text-xs font-bold text-emerald-600">
                  {answeredCount}/{totalQuestions} câu
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-emerald-600 flex-shrink-0" />
                  <span>Đã làm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300 flex-shrink-0" />
                  <span>Chưa làm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-400 flex-shrink-0" />
                  <span>Đánh dấu</span>
                </div>
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                {exam.questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  const isFlagged = flagged[q.id];

                  let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                  if (isAnswered) {
                    btnStyle = 'bg-emerald-600 text-white font-bold shadow-xs';
                  }
                  if (isFlagged) {
                    btnStyle = isAnswered
                      ? 'bg-emerald-600 text-white ring-2 ring-amber-400 font-bold'
                      : 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
                  }
                  if (isCurrent) {
                    btnStyle += ' ring-2 ring-slate-900 ring-offset-2 scale-105';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer relative ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Nộp bài thi ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMISSION CONFIRMATION MODAL */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Xác nhận nộp bài thi?</h3>
                <p className="text-xs text-slate-500">
                  Sau khi nộp bài, hệ thống SmartLearn sẽ tự động chấm điểm và phân tích đáp án chi tiết.
                </p>
              </div>

              {/* Status Stats */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-center">
                  <div className="text-xl font-black text-emerald-600">{answeredCount}</div>
                  <div className="text-[11px] font-semibold text-slate-500">Đã trả lời</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-rose-500">
                    {totalQuestions - answeredCount}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Chưa trả lời</div>
                </div>
              </div>

              {totalQuestions - answeredCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Bạn vẫn còn <strong>{totalQuestions - answeredCount}</strong> câu chưa có câu trả lời. Bạn có chắc muốn nộp sớm?
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Làm tiếp
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => executeSubmit(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang nộp...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Nộp bài ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUTO SUBMITTED MODAL */}
        {autoSubmitted && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <Clock className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-slate-900">Đã hết giờ làm bài!</h3>
              <p className="text-xs text-slate-500">
                Hệ thống đang tự động thu bài và chấm điểm cho bạn...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
