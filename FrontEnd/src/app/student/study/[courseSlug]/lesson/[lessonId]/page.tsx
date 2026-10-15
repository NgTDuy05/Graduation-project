'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StudentLayout } from '../../../../../../components/layout/StudentLayout';
import { studyService } from '../../../../../../services/study.service';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { Lesson, UserProgress, FlashcardItem } from '../../../../../../types/study';
import { MathRenderer } from '../../../../../../components/common/MathRenderer';
import {
  BookOpen,
  Layers,
  FileCheck2,
  RotateCcw,
  Bot,
  ChevronLeft,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Send,
  Loader2,
  Volume2,
  RefreshCw,
  Trophy,
  Check,
  ArrowRight,
} from 'lucide-react';

export default function LessonDetailPage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const lessonId = params.lessonId as string;
  const { user } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'theory' | 'flashcards' | 'practice' | 'review'>('theory');
  const [isLoading, setIsLoading] = useState(true);

  // Gamification XP toast
  const [bonusXPToast, setBonusXPToast] = useState<number | null>(null);

  // Tab 2: Flashcards State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<string[]>([]);

  // Tab 3: Practice State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmittedPractice, setIsSubmittedPractice] = useState(false);
  const [practiceScore, setPracticeScore] = useState<number>(0);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);

  // AI Tutor Drawer State
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<Array<{ sender: 'user' | 'tutor'; text: string }>>([
    {
      sender: 'tutor',
      text: 'Xin chào em! Thầy là Gia sư SmartLearn AI. Em có thắc mắc gì về bài học này cần thầy giải đáp không?',
    },
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTutorThinking, setIsTutorThinking] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await studyService.getLessonById(lessonId, user?.id);
        setLesson(data.lesson);
        setUserProgress(data.userProgress || null);

        if (data.userProgress) {
          if (data.userProgress.learnedFlashcardIds) {
            setLearnedCards(data.userProgress.learnedFlashcardIds);
          }
          if (data.userProgress.wrongQuestionIds) {
            setWrongQuestionIds(data.userProgress.wrongQuestionIds);
          }
          if (data.userProgress.practiceScore > 0) {
            setPracticeScore(data.userProgress.practiceScore);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId, user?.id]);

  // Handle Complete Theory
  const handleCompleteTheory = async () => {
    try {
      const res = await studyService.saveProgress(lessonId, {
        courseSlug,
        completedTheory: true,
      });
      if (res.bonusXP > 0) {
        setBonusXPToast(res.bonusXP);
        setTimeout(() => setBonusXPToast(null), 3000);
      }
      setActiveTab('flashcards');
    } catch {
      setActiveTab('flashcards');
    }
  };

  // Handle Flashcard Mark
  const handleMarkFlashcard = async (cardId: string, isLearned: boolean) => {
    let updated = [...learnedCards];
    if (isLearned && !updated.includes(cardId)) {
      updated.push(cardId);
    } else if (!isLearned && updated.includes(cardId)) {
      updated = updated.filter((id) => id !== cardId);
    }
    setLearnedCards(updated);

    // Save to progress
    await studyService.saveProgress(lessonId, {
      courseSlug,
      learnedFlashcardIds: updated,
    });

    // Next card
    if (lesson && currentCardIndex < lesson.flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  // Handle Practice Submit
  const handlePracticeSubmit = async () => {
    if (!lesson) return;
    let score = 0;
    const wrongs: string[] = [];

    lesson.practiceQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      } else {
        wrongs.push(q.id);
      }
    });

    const scaledScore = Math.round((score / lesson.practiceQuestions.length) * 10);
    setPracticeScore(scaledScore);
    setWrongQuestionIds(wrongs);
    setIsSubmittedPractice(true);

    try {
      const res = await studyService.saveProgress(lessonId, {
        courseSlug,
        practiceScore: scaledScore,
        wrongQuestionIds: wrongs,
      });
      if (res.bonusXP > 0) {
        setBonusXPToast(res.bonusXP);
        setTimeout(() => setBonusXPToast(null), 3500);
      }
    } catch {
      //
    }
  };

  // Handle Ask AI Tutor
  const handleSendTutorMessage = async (customPrompt?: string) => {
    const questionText = customPrompt || tutorInput;
    if (!questionText.trim()) return;

    const userMsg = { sender: 'user' as const, text: questionText };
    setTutorMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setTutorInput('');
    setIsTutorThinking(true);

    try {
      const res = await studyService.askTutor({
        lessonId,
        question: questionText,
        lessonTitle: lesson?.title,
      });
      setTutorMessages((prev) => [
        ...prev,
        { sender: 'tutor', text: res.response },
      ]);
    } catch {
      setTutorMessages((prev) => [
        ...prev,
        { sender: 'tutor', text: 'Xin lỗi em, hiện tại kết nối gia sư đang bận. Em vui lòng thử lại sau giây lát nhé!' },
      ]);
    } finally {
      setIsTutorThinking(false);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout pageTitle="Đang tải bài học">
        <div className="py-20 text-center text-sm text-slate-400">
          Đang chuẩn bị học liệu...
        </div>
      </StudentLayout>
    );
  }

  if (!lesson) {
    return (
      <StudentLayout pageTitle="Không tìm thấy bài học">
        <div className="bg-white rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-12 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Bài học không tồn tại</h2>
          <Link
            href={`/student/study/${courseSlug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại khoá học</span>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const flashcards = lesson.flashcards || [];
  const currentCard: FlashcardItem | undefined = flashcards[currentCardIndex];
  const isCurrentCardLearned = currentCard ? learnedCards.includes(currentCard.id) : false;

  return (
    <StudentLayout pageTitle={lesson.title}>
      {/* XP Toast Notification */}
      {bonusXPToast && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl flex items-center gap-3 animate-bounce-subtle">
          <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
          <div>
            <p className="font-extrabold text-sm">Tuyệt vời! +{bonusXPToast} XP Điểm Sét ⚡</p>
            <p className="text-xs text-blue-100">Tiến độ học bài của bạn đã được ghi nhận.</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="space-y-6 relative">
        {/* Top Breadcrumb & Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href={`/student/study/${courseSlug}`} className="hover:text-blue-600 flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Mục lục khoá học</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-xs">{lesson.title}</span>
          </div>

          {/* AI Tutor Toggle Button */}
          <button
            onClick={() => setIsTutorOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-102 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Gia sư AI SmartLearn</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* 4-Tabs Navigation Header */}
        <div className="bg-white rounded-3xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'theory'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Lý thuyết</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Flashcards</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
              {learnedCards.length}/{flashcards.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>3. Bài tập</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'review'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>4. Ôn lỗi sai</span>
            {wrongQuestionIds.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                {wrongQuestionIds.length}
              </span>
            )}
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: LÝ THUYẾT TRỌNG TÂM */}
        {/* ============================================================ */}
        {activeTab === 'theory' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary Highlights */}
            {lesson.summary && lesson.summary.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Điểm cốt lõi cần nhớ</span>
                </div>
                <ul className="space-y-1.5">
                  {lesson.summary.map((point, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Theory Text Content */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {lesson.title}
              </h1>

              <div className="max-w-none text-sm sm:text-base leading-relaxed text-slate-700">
                <MathRenderer content={lesson.theoryContent} />
              </div>

              {/* Complete Theory Action Button */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  Đã đọc xong lý thuyết? Chuyển sang thẻ ghi nhớ để ôn tập sâu hơn.
                </span>
                <button
                  onClick={handleCompleteTheory}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Đã hiểu lý thuyết (+10 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: FLASHCARD GHI NHỚ */}
        {/* ============================================================ */}
        {activeTab === 'flashcards' && (
          <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
            {flashcards.length > 0 && currentCard ? (
              <div className="space-y-5">
                {/* Header progress */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>
                    Thẻ {currentCardIndex + 1} / {flashcards.length}
                  </span>
                  <span className="text-blue-600">
                    Đã thuộc: {learnedCards.length}/{flashcards.length}
                  </span>
                </div>

                {/* 3D Flip Flashcard */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="min-h-[260px] sm:min-h-[300px] w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-lg hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between text-center select-none relative group"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                      {isFlipped ? 'Mặt sau: Định nghĩa & Ví dụ' : 'Mặt trước: Thuật ngữ'}
                    </span>
                    <span className="text-slate-400 text-[11px] group-hover:text-blue-600">
                      (Nhấn để lật thẻ)
                    </span>
                  </div>

                  <div className="py-6 space-y-3">
                    {!isFlipped ? (
                      <div className="space-y-2">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                          {currentCard.term}
                        </h3>
                        <p className="text-xs text-slate-400">Nhấn vào thẻ để xem định nghĩa</p>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="text-base sm:text-lg font-bold text-blue-700">
                          <MathRenderer content={currentCard.definition} />
                        </div>
                        {currentCard.example && (
                          <div className="p-3 rounded-2xl bg-slate-50 text-xs text-slate-600 border border-slate-100 text-left">
                            <strong>Ví dụ minh họa:</strong>
                            <MathRenderer content={currentCard.example} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center text-xs text-slate-400">
                    Độ khó: <span className="font-semibold capitalize ml-1">{currentCard.difficulty || 'Trung bình'}</span>
                  </div>
                </div>

                {/* Rating buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleMarkFlashcard(currentCard.id, false)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cần ôn lại</span>
                  </button>

                  <button
                    onClick={() => handleMarkFlashcard(currentCard.id, true)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã thuộc lòng (+XP)</span>
                  </button>
                </div>

                {/* Card navigation buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex((prev) => prev - 1);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    ← Thẻ trước
                  </button>

                  <button
                    disabled={currentCardIndex === flashcards.length - 1}
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex((prev) => prev + 1);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    Thẻ tiếp theo →
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Chưa có thẻ ghi nhớ nào trong bài học này.
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: BÀI TẬP CỦNG CỐ */}
        {/* ============================================================ */}
        {activeTab === 'practice' && (
          <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
            {/* Score Banner if submitted */}
            {isSubmittedPractice && (
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-300" />
                    <span className="font-extrabold text-lg">Kết quả bài tập củng cố</span>
                  </div>
                  <p className="text-xs text-blue-100">
                    Bạn đạt {practiceScore}/10 điểm. Hãy xem lại lời giải chi tiết bên dưới.
                  </p>
                </div>
                <div className="text-3xl font-black">{practiceScore}/10</div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-5">
              {lesson.practiceQuestions?.map((q, qIndex) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCorrect = selectedAnswers[q.id] === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {qIndex + 1}
                      </span>
                      <div className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                        <MathRenderer content={q.question} />
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2 pl-10">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = selectedAnswers[q.id] === optIndex;
                        let optionStyle = 'border-slate-200 hover:bg-slate-50 text-slate-700';

                        if (isSubmittedPractice) {
                          if (optIndex === q.correctIndex) {
                            optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-500/20';
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            disabled={isSubmittedPractice}
                            onClick={() =>
                              setSelectedAnswers({
                                ...selectedAnswers,
                                [q.id]: optIndex,
                              })
                            }
                            className={`w-full p-3 rounded-2xl border text-left text-xs sm:text-sm flex items-center gap-3 transition-all cursor-pointer ${optionStyle}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <div className="flex-1">
                              <MathRenderer content={opt} />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation after submit */}
                    {isSubmittedPractice && (
                      <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          <span>Giải thích chi tiết:</span>
                        </div>
                        <div className="text-slate-600 leading-relaxed pl-5">
                          <MathRenderer content={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Action Button */}
            {!isSubmittedPractice ? (
              <div className="pt-2">
                <button
                  onClick={handlePracticeSubmit}
                  disabled={Object.keys(selectedAnswers).length === 0}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Nộp bài chấm điểm (+15 XP)</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    setIsSubmittedPractice(false);
                    setSelectedAnswers({});
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Làm lại bài tập</span>
                </button>

                <button
                  onClick={() => setActiveTab('review')}
                  className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xem các câu sai</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ÔN LẠI LỖI SAI */}
        {/* ============================================================ */}
        {activeTab === 'review' && (
          <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
            {wrongQuestionIds.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl space-y-2">
                  <h3 className="font-bold text-rose-800 text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Bạn có {wrongQuestionIds.length} câu làm sai cần lưu ý</span>
                  </h3>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Xem kỹ lời giải thích và bản chất câu hỏi để không mắc lại trong các bài thi thử trắc nghiệm nhé.
                  </p>
                </div>

                {lesson.practiceQuestions
                  ?.filter((q) => wrongQuestionIds.includes(q.id))
                  .map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white rounded-3xl p-6 border border-rose-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          !
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{q.question}</h4>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                        <span className="font-bold text-emerald-800">Đáp án chính xác: </span>
                        <span className="text-emerald-900 font-semibold">
                          {q.options[q.correctIndex]}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800">Không có câu sai nào!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tuyệt vời! Bạn đã hoàn thành chính xác các câu hỏi củng cố hoặc chưa ghi nhận câu sai nào trong bài này.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* DRAWER GIA SƯ AI SMARTLEARN */}
        {/* ============================================================ */}
        {isTutorOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              onClick={() => setIsTutorOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />

            {/* Sliding Drawer */}
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slideLeft">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Gia sư SmartLearn AI</h3>
                    <p className="text-[11px] text-blue-100">Trợ lý học tập thông minh 24/7</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsTutorOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
                {tutorMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none whitespace-pre-line'
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-xs'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        msg.text
                      ) : (
                        <MathRenderer content={msg.text} />
                      )}
                    </div>
                  </div>
                ))}

                {isTutorThinking && (
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 max-w-[70%]">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Gia sư đang suy nghĩ câu trả lời...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSendTutorMessage('Tóm tắt bài này trong 3 ý chính')}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap cursor-pointer"
                >
                  💡 Tóm tắt 3 ý
                </button>
                <button
                  type="button"
                  onClick={() => handleSendTutorMessage('Cho em 1 ví dụ cụ thể về bài này')}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                >
                  📝 Ví dụ cụ thể
                </button>
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendTutorMessage();
                  }}
                  placeholder="Nhập thắc mắc của em..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <button
                  type="button"
                  disabled={!tutorInput.trim() || isTutorThinking}
                  onClick={() => handleSendTutorMessage()}
                  className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
