'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { classService } from '../../../services/class.service';
import { ClassItem } from '../../../types/class';
import {
  School,
  PlusCircle,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Join modal state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const data = await classService.getStudentClasses();
      setClasses(data);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');

    if (!classCodeInput.trim()) {
      setJoinError('Vui lòng nhập mã lớp học');
      return;
    }

    setIsJoining(true);
    try {
      const res = await classService.joinClass(classCodeInput.trim());
      setJoinSuccess(res.message);
      setClassCodeInput('');
      fetchClasses();
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setJoinSuccess('');
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setJoinError(error.response?.data?.message || 'Không thể tham gia lớp. Vui lòng kiểm tra lại mã!');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <StudentLayout pageTitle="Lớp học của tôi">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-xs">
              <School className="w-3.5 h-3.5" />
              <span>Không gian lớp học trực tuyến</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Lớp Học Trực Tuyến
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              Nơi nhận thông báo từ Thầy Cô, xem bài tập được giao và theo dõi kết quả nộp bài đúng hạn.
            </p>
          </div>

          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer flex-shrink-0"
          >
            <KeyRound className="w-4 h-4" />
            <span>Tham gia lớp học</span>
          </button>
        </div>

        {/* Classes Grid */}
        <div>
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Đang tải danh sách lớp học...
            </div>
          ) : classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
                        <School className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                        Lớp {cls.grade} • {cls.subject}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {cls.description || 'Chưa có mô tả cho lớp học này.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>GV: {cls.teacher?.fullName || 'Thầy/Cô'}</span>
                      <span className="font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 text-slate-600">
                        {cls.classCode}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <Link
                      href={`/student/classes/${cls.id}`}
                      className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                    >
                      <span>Vào xem bài tập & lớp</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <School className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Bạn chưa tham gia lớp học nào</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hãy hỏi Giáo viên của bạn mã lớp gồm 8 ký tự (hoặc gửi Mã học sinh của bạn cho Giáo viên) để được thêm vào lớp nhé!
              </p>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nhập mã tham gia lớp</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Tham Gia Lớp Bằng Mã */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-base text-slate-900">Tham gia lớp học</h3>
                </div>
                <button
                  onClick={() => setIsJoinModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {joinError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              {joinSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{joinSuccess}</span>
                </div>
              )}

              <form onSubmit={handleJoinClass} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mã lớp học (8 ký tự do Giáo viên cung cấp)
                  </label>
                  <input
                    type="text"
                    value={classCodeInput}
                    onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                    placeholder="VD: CLS8X9Y2"
                    maxLength={10}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono font-bold tracking-widest text-center text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isJoining || !classCodeInput.trim()}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra mã...</span>
                    </>
                  ) : (
                    <>
                      <span>Tham gia ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
