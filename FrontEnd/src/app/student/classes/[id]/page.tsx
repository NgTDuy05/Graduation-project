'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StudentLayout } from '../../../../components/layout/StudentLayout';
import { classService } from '../../../../services/class.service';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  ClassItem,
  Assignment,
  AssignmentSubmission,
} from '../../../../types/class';
import {
  School,
  FileCheck2,
  Users,
  Clock,
  ChevronLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  Award,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

export default function StudentClassDetailPage() {
  const params = useParams();
  const classId = Number(params.id);
  const { user } = useAuth();

  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'assignments' | 'members'>('assignments');
  const [isLoading, setIsLoading] = useState(true);

  // Submit modal
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchClassDetail = async () => {
    setIsLoading(true);
    try {
      const res = await classService.getClassById(classId);
      setClassData(res.class);
      setSubmissions(res.studentSubmissions || []);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) fetchClassDetail();
  }, [classId]);

  const handleCopyCode = () => {
    if (classData?.classCode) {
      navigator.clipboard.writeText(classData.classCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !submitContent.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const res = await classService.submitAssignment(
        submittingAssignment.id,
        submitContent.trim(),
      );
      setSubmitSuccess(res.message);
      fetchClassDetail();
      setTimeout(() => {
        setSubmittingAssignment(null);
        setSubmitContent('');
        setSubmitSuccess('');
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setSubmitError(error.response?.data?.message || 'Nộp bài thất bại. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout pageTitle="Đang tải lớp học">
        <div className="py-20 text-center text-sm text-slate-400">
          Đang tải thông tin lớp học...
        </div>
      </StudentLayout>
    );
  }

  if (!classData) {
    return (
      <StudentLayout pageTitle="Không tìm thấy lớp">
        <div className="bg-white rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-12 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Lớp học không tồn tại</h2>
          <Link
            href="/student/classes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const assignments = classData.assignments || [];
  const members = classData.members?.filter((m) => m.roleInClass === 'STUDENT') || [];

  return (
    <StudentLayout pageTitle={classData.name}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/student/classes" className="hover:text-indigo-600 flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Lớp học của tôi</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{classData.name}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                Lớp {classData.grade}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                Môn {classData.subject}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {classData.name}
            </h1>

            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              {classData.description || 'Lớp học trực tuyến trên nền tảng SmartLearn.'}
            </p>

            <div className="pt-1 flex items-center gap-4 text-xs font-medium text-indigo-100">
              <span>Giáo viên: <strong>{classData.teacher?.fullName}</strong></span>
              <span>•</span>
              <span>{members.length} Học sinh</span>
            </div>
          </div>

          {/* Class Code Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center text-center min-w-[180px]">
            <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">
              Mã lớp học
            </span>
            <span className="text-2xl font-mono font-black tracking-widest my-1 select-all">
              {classData.classCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white text-indigo-700 text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200/80 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'assignments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Bài tập được giao ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh sách bạn học ({members.length})</span>
          </button>
        </div>

        {/* Tab 1: Assignments */}
        {activeTab === 'assignments' && (
          <div className="space-y-4 animate-fadeIn">
            {assignments.length > 0 ? (
              assignments.map((asg) => {
                const mySub = submissions.find((s) => s.assignmentId === asg.id);
                const isSubmitted = mySub?.status === 'DA_NOP' || mySub?.status === 'QUA_HAN';
                const hasScore = mySub?.score !== null && mySub?.score !== undefined;

                // Check extension
                const ext = asg.extensions?.find(
                  (e) => e.studentId === user?.id || e.studentId === null,
                );
                const effectiveDeadline = ext ? new Date(ext.extendedDeadline) : new Date(asg.deadline);
                const isOverdue = new Date() > effectiveDeadline;

                return (
                  <div
                    key={asg.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {isSubmitted ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            {mySub?.status === 'QUA_HAN' ? 'Đã nộp muộn' : 'Đã nộp bài'}
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                            Quá hạn nộp
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                            Chưa nộp bài
                          </span>
                        )}

                        {ext && (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                            Đã được gia hạn
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-slate-900">{asg.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {asg.description || 'Hoàn thành bài tập và nộp lại văn bản hoặc link bài làm.'}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Hạn chót: <strong>{effectiveDeadline.toLocaleString('vi-VN')}</strong>
                        </span>
                      </div>

                      {/* Display Score & Feedback if graded */}
                      {hasScore && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs space-y-1">
                          <div className="flex items-center gap-2 font-bold text-indigo-900">
                            <Award className="w-4 h-4 text-indigo-600" />
                            <span>Điểm số: {mySub?.score}/10</span>
                          </div>
                          {mySub?.feedback && (
                            <p className="text-slate-600 pl-6">
                              Lời phê của Thầy/Cô: &ldquo;{mySub.feedback}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSubmittingAssignment(asg);
                          setSubmitContent(mySub?.content || '');
                        }}
                        className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        {isSubmitted ? 'Xem lại / Nộp lại' : 'Nộp bài ngay'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800">Chưa có bài tập nào</h3>
                <p className="text-xs text-slate-500">
                  Thầy Cô hiện chưa giao bài tập cho lớp. Hãy theo dõi thông báo nhé!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 animate-fadeIn">
            <h3 className="font-bold text-base text-slate-900">
              Danh sách bạn cùng lớp ({members.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {m.user?.fullName?.charAt(0).toUpperCase() || 'H'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">
                      {m.user?.fullName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Mã HS: {m.user?.studentCode || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Nộp Bài Tập */}
        {submittingAssignment && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Nộp bài tập</h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{submittingAssignment.title}</p>
                </div>
                <button
                  onClick={() => setSubmittingAssignment(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {submitError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nội dung bài làm hoặc Link bài giải (Google Docs, Drive, Github...)
                  </label>
                  <textarea
                    rows={5}
                    value={submitContent}
                    onChange={(e) => setSubmitContent(e.target.value)}
                    placeholder="Nhập câu trả lời hoặc dán đường dẫn link bài làm của em tại đây..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittingAssignment(null)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !submitContent.trim()}
                    className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang nộp...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Xác nhận nộp bài</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
