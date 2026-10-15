'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { classService } from '../../services/class.service';
import {
  ClassItem,
  Assignment,
  AssignmentSubmission,
} from '../../types/class';
import {
  School,
  PlusCircle,
  Users,
  FileCheck2,
  Clock,
  LogOut,
  Sparkles,
  KeyRound,
  UserPlus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Award,
  ChevronRight,
  Loader2,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export default function TeacherPortalPage() {
  const { user, logout } = useAuth();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active view tab in selected class
  const [activeTab, setActiveTab] = useState<'assignments' | 'students' | 'submissions'>('assignments');

  // Modals state
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<number>(12);
  const [newClassSubject, setNewClassSubject] = useState('Toán');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  // Add student modal
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [addStudentMsg, setAddStudentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Create Assignment modal
  const [isCreateAsgOpen, setIsCreateAsgOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDeadline, setAsgDeadline] = useState('');
  const [asgAllowLate, setAsgAllowLate] = useState(true);
  const [isCreatingAsg, setIsCreatingAsg] = useState(false);

  // Submissions tracking
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionsData, setSubmissionsData] = useState<{
    stats: { total: number; submitted: number; late: number; pending: number; graded: number };
    submissions: AssignmentSubmission[];
  } | null>(null);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Grade Modal
  const [gradingSub, setGradingSub] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(10);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  // Extend Deadline Modal
  const [extendingAsg, setExtendingAsg] = useState<Assignment | null>(null);
  const [extendDate, setExtendDate] = useState('');
  const [extendStudentId, setExtendStudentId] = useState<number | null>(null);
  const [extendReason, setExtendReason] = useState('');
  const [isExtending, setIsExtending] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const data = await classService.getTeacherClasses();
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        // Load first class details
        loadClassDetail(data[0].id);
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  const loadClassDetail = async (classId: number) => {
    try {
      const res = await classService.getClassById(classId);
      setSelectedClass(res.class);
    } catch {
      //
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setIsCreatingClass(true);
    try {
      const created = await classService.createClass({
        name: newClassName.trim(),
        grade: newClassGrade,
        subject: newClassSubject,
        description: newClassDesc.trim(),
      });
      setIsCreateClassOpen(false);
      setNewClassName('');
      setNewClassDesc('');
      await fetchClasses();
      loadClassDetail(created.id);
    } catch {
      //
    } finally {
      setIsCreatingClass(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !studentCodeInput.trim()) return;

    setIsAddingStudent(true);
    setAddStudentMsg(null);
    try {
      const res = await classService.addStudentByCode(
        selectedClass.id,
        studentCodeInput.trim(),
      );
      setAddStudentMsg({ type: 'success', text: res.message });
      setStudentCodeInput('');
      loadClassDetail(selectedClass.id);
      setTimeout(() => {
        setIsAddStudentOpen(false);
        setAddStudentMsg(null);
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setAddStudentMsg({
        type: 'error',
        text: error.response?.data?.message || 'Không thể thêm học sinh. Vui lòng kiểm tra lại mã!',
      });
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (memberId: number) => {
    if (!selectedClass) return;
    if (!confirm('Bạn có chắc chắn muốn xoá học sinh này khỏi lớp?')) return;

    try {
      await classService.removeStudent(selectedClass.id, memberId);
      loadClassDetail(selectedClass.id);
    } catch {
      //
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !asgTitle.trim() || !asgDeadline) return;

    setIsCreatingAsg(true);
    try {
      await classService.createAssignment(selectedClass.id, {
        title: asgTitle.trim(),
        description: asgDesc.trim(),
        deadline: new Date(asgDeadline).toISOString(),
        allowLateSubmission: asgAllowLate,
      });
      setIsCreateAsgOpen(false);
      setAsgTitle('');
      setAsgDesc('');
      setAsgDeadline('');
      loadClassDetail(selectedClass.id);
    } catch {
      //
    } finally {
      setIsCreatingAsg(false);
    }
  };

  const handleViewSubmissions = async (asg: Assignment) => {
    setSelectedAssignment(asg);
    setActiveTab('submissions');
    setIsLoadingSubmissions(true);
    try {
      const data = await classService.getAssignmentSubmissions(asg.id);
      setSubmissionsData(data);
    } catch {
      //
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;

    setIsGrading(true);
    try {
      await classService.gradeSubmission(gradingSub.id, {
        score: Number(gradeScore),
        feedback: gradeFeedback.trim(),
      });
      setGradingSub(null);
      if (selectedAssignment) {
        handleViewSubmissions(selectedAssignment);
      }
    } catch {
      //
    } finally {
      setIsGrading(false);
    }
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingAsg || !extendDate) return;

    setIsExtending(true);
    try {
      await classService.extendDeadline(extendingAsg.id, {
        extendedDeadline: new Date(extendDate).toISOString(),
        studentId: extendStudentId || undefined,
        reason: extendReason.trim(),
      });
      setExtendingAsg(null);
      setExtendDate('');
      setExtendReason('');
      if (selectedClass) loadClassDetail(selectedClass.id);
    } catch {
      //
    } finally {
      setIsExtending(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <ProtectedRoute allowedRoles={['GIAO_VIEN']}>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <School className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                SmartLearn
              </span>
              <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Cổng Giáo Viên
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">
              Thầy/Cô: {user?.fullName}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Content Body: Sidebar List of Classes + Main Panel */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
          {/* Left Column: Classes List & Create Button */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base text-slate-900">Lớp đang dạy</h2>
                <button
                  onClick={() => setIsCreateClassOpen(true)}
                  className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                  title="Tạo lớp học mới"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Class items */}
              <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                {classes.length > 0 ? (
                  classes.map((cls) => {
                    const isSelected = selectedClass?.id === cls.id;
                    return (
                      <button
                        key={cls.id}
                        onClick={() => {
                          setSelectedClass(cls);
                          loadClassDetail(cls.id);
                        }}
                        className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 truncate">
                            {cls.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-indigo-700">
                            Lớp {cls.grade}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{cls.subject}</span>
                          <span className="font-mono font-bold text-slate-700">
                            {cls.classCode}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Chưa có lớp nào. Hãy tạo lớp học đầu tiên!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Class Workspace */}
          <div className="flex-1 min-w-0">
            {selectedClass ? (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                        Khối {selectedClass.grade}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                        {selectedClass.subject}
                      </span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                      {selectedClass.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
                      {selectedClass.description || 'Quản lý học sinh, bài tập và theo dõi tiến độ nộp bài.'}
                    </p>
                  </div>

                  {/* Class Code Badge */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[170px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                      Mã tham gia lớp
                    </span>
                    <div className="text-2xl font-mono font-black tracking-widest my-1 select-all">
                      {selectedClass.classCode}
                    </div>
                    <button
                      onClick={() => copyCode(selectedClass.classCode)}
                      className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 bg-white text-indigo-700 text-xs font-bold rounded-lg shadow-xs hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-tabs Navigation */}
                <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                      activeTab === 'assignments'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Bài tập ({selectedClass.assignments?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('students')}
                    className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                      activeTab === 'students'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Học sinh ({selectedClass.members?.filter((m) => m.roleInClass === 'STUDENT').length || 0})</span>
                  </button>

                  {selectedAssignment && (
                    <button
                      onClick={() => setActiveTab('submissions')}
                      className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                        activeTab === 'submissions'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span>Bài nộp: {selectedAssignment.title.substring(0, 15)}...</span>
                    </button>
                  )}
                </div>

                {/* ================= TAB: ASSIGNMENTS ================= */}
                {activeTab === 'assignments' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-base text-slate-900">Danh sách bài tập</h3>
                      <button
                        onClick={() => setIsCreateAsgOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Giao bài tập mới</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedClass.assignments && selectedClass.assignments.length > 0 ? (
                        selectedClass.assignments.map((asg) => (
                          <div
                            key={asg.id}
                            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 max-w-xl">
                              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                                {asg.title}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-2">
                                {asg.description || 'Chưa có mô tả chi tiết.'}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Hạn: {new Date(asg.deadline).toLocaleString('vi-VN')}</span>
                                </span>
                                <span>•</span>
                                <span>{asg.allowLateSubmission ? 'Cho nộp muộn' : 'Không nộp muộn'}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleViewSubmissions(asg)}
                                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                              >
                                Xem bài nộp
                              </button>

                              <button
                                onClick={() => {
                                  setExtendingAsg(asg);
                                  setExtendDate(new Date(asg.deadline).toISOString().substring(0, 16));
                                }}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                              >
                                Gia hạn hạn nộp
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center bg-white rounded-3xl border border-slate-200/80 p-8 text-xs text-slate-400">
                          Chưa có bài tập nào. Hãy bấm &quot;Giao bài tập mới&quot; để bắt đầu!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= TAB: STUDENTS ================= */}
                {activeTab === 'students' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-base text-slate-900">
                        Danh sách học sinh trong lớp
                      </h3>
                      <button
                        onClick={() => setIsAddStudentOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Thêm học sinh bằng Mã HS</span>
                      </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
                      {selectedClass.members?.filter((m) => m.roleInClass === 'STUDENT').length ? (
                        selectedClass.members
                          ?.filter((m) => m.roleInClass === 'STUDENT')
                          .map((m) => (
                            <div
                              key={m.id}
                              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                                  {m.user?.fullName?.charAt(0).toUpperCase() || 'H'}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-slate-900">
                                    {m.user?.fullName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Email: {m.user?.email} • Mã HS: <span className="font-mono font-bold text-indigo-600">{m.user?.studentCode}</span>
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleRemoveStudent(m.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Xoá học sinh khỏi lớp"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400">
                          Lớp chưa có học sinh nào. Hãy dùng nút &quot;Thêm học sinh bằng Mã HS&quot; hoặc gửi Mã lớp cho học sinh nhé!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= TAB: SUBMISSIONS TRACKING ================= */}
                {activeTab === 'submissions' && selectedAssignment && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="font-bold text-base text-slate-900">
                            Tiến độ nộp bài: {selectedAssignment.title}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Hạn chót: {new Date(selectedAssignment.deadline).toLocaleString('vi-VN')}
                          </p>
                        </div>

                        <button
                          onClick={() => handleViewSubmissions(selectedAssignment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Làm mới</span>
                        </button>
                      </div>

                      {/* Stats grid */}
                      {submissionsData && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center">
                            <div className="text-2xl font-black text-emerald-700">
                              {submissionsData.stats.submitted}
                            </div>
                            <div className="text-[11px] font-bold text-emerald-800 uppercase mt-0.5">
                              Đã nộp bài
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-center">
                            <div className="text-2xl font-black text-amber-700">
                              {submissionsData.stats.pending}
                            </div>
                            <div className="text-[11px] font-bold text-amber-800 uppercase mt-0.5">
                              Chưa nộp
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-center">
                            <div className="text-2xl font-black text-rose-700">
                              {submissionsData.stats.late}
                            </div>
                            <div className="text-[11px] font-bold text-rose-800 uppercase mt-0.5">
                              Nộp muộn
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 text-center">
                            <div className="text-2xl font-black text-blue-700">
                              {submissionsData.stats.graded}
                            </div>
                            <div className="text-[11px] font-bold text-blue-800 uppercase mt-0.5">
                              Đã chấm điểm
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submissions list */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
                      {isLoadingSubmissions ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                          Đang tải danh sách bài nộp...
                        </div>
                      ) : submissionsData?.submissions?.length ? (
                        submissionsData.submissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="space-y-1.5 min-w-0 max-w-xl">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  {sub.student?.fullName || 'Học sinh'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  (Mã: {sub.student?.studentCode})
                                </span>

                                {sub.status === 'DA_NOP' && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                    Đã nộp
                                  </span>
                                )}
                                {sub.status === 'QUA_HAN' && (
                                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold">
                                    Nộp muộn
                                  </span>
                                )}
                                {sub.status === 'CHUA_LAM' && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">
                                    Chưa nộp
                                  </span>
                                )}
                              </div>

                              {sub.content ? (
                                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 break-words">
                                  {sub.content}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-400 italic">Chưa nộp bài</p>
                              )}

                              {sub.score !== null && sub.score !== undefined && (
                                <div className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                                  <Award className="w-3.5 h-3.5" />
                                  <span>Điểm: {sub.score}/10</span>
                                  {sub.feedback && (
                                    <span className="text-slate-500 font-normal">
                                      - &ldquo;{sub.feedback}&rdquo;
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setGradingSub(sub);
                                  setGradeScore(sub.score !== null && sub.score !== undefined ? sub.score : 10);
                                  setGradeFeedback(sub.feedback || '');
                                }}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                              >
                                {sub.score !== null && sub.score !== undefined ? 'Sửa điểm' : 'Chấm điểm'}
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400">
                          Chưa có bài nộp nào.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
                <School className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-800">Chọn hoặc tạo một lớp học</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy bấm vào nút &quot;Tạo lớp học mới&quot; ở cột bên trái để bắt đầu quản lý học sinh và giao bài tập.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MODAL 1: TẠO LỚP HỌC MỚI */}
        {isCreateClassOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Tạo lớp học mới</h3>
                <button
                  onClick={() => setIsCreateClassOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Tên lớp học</label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="VD: Toán Học 12A1 - Ôn Thi THPT"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Khối lớp</label>
                    <select
                      value={newClassGrade}
                      onChange={(e) => setNewClassGrade(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                        <option key={g} value={g}>Lớp {g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Môn học</label>
                    <select
                      value={newClassSubject}
                      onChange={(e) => setNewClassSubject(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    >
                      {['Toán', 'Vật lý', 'Hóa học', 'Sinh học', 'Tiếng Anh', 'Ngữ văn', 'Lịch sử'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Mô tả ngắn</label>
                  <textarea
                    rows={3}
                    value={newClassDesc}
                    onChange={(e) => setNewClassDesc(e.target.value)}
                    placeholder="Mô tả mục tiêu lớp học..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingClass || !newClassName.trim()}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingClass ? 'Đang tạo lớp...' : 'Tạo lớp và sinh mã lớp'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: THÊM HỌC SINH BẰNG MÃ HS */}
        {isAddStudentOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Thêm học sinh vào lớp</h3>
                <button
                  onClick={() => setIsAddStudentOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {addStudentMsg && (
                <div
                  className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    addStudentMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}
                >
                  {addStudentMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{addStudentMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mã học sinh (6 ký tự in hoa do học sinh cung cấp)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={studentCodeInput}
                    onChange={(e) => setStudentCodeInput(e.target.value.toUpperCase())}
                    placeholder="VD: ABC123"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-mono font-bold tracking-widest text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingStudent || studentCodeInput.length !== 6}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAddingStudent ? 'Đang kiểm tra...' : 'Thêm học sinh'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: GIAO BÀI TẬP MỚI */}
        {isCreateAsgOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Giao bài tập mới</h3>
                <button
                  onClick={() => setIsCreateAsgOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Tiêu đề bài tập</label>
                  <input
                    type="text"
                    required
                    value={asgTitle}
                    onChange={(e) => setAsgTitle(e.target.value)}
                    placeholder="VD: Bài tập tuần 1 - Khảo sát hàm số"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Hạn chót nộp bài</label>
                  <input
                    type="datetime-local"
                    required
                    value={asgDeadline}
                    onChange={(e) => setAsgDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Yêu cầu / Hướng dẫn</label>
                  <textarea
                    rows={3}
                    value={asgDesc}
                    onChange={(e) => setAsgDesc(e.target.value)}
                    placeholder="Hướng dẫn học sinh làm bài..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowLate"
                    checked={asgAllowLate}
                    onChange={(e) => setAsgAllowLate(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <label htmlFor="allowLate" className="text-xs text-slate-700">
                    Cho phép học sinh nộp muộn sau hạn (đánh dấu Nộp muộn)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingAsg || !asgTitle.trim() || !asgDeadline}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingAsg ? 'Đang giao bài...' : 'Giao bài tập'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: CHẤM ĐIỂM BÀI NỘP */}
        {gradingSub && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  Chấm điểm: {gradingSub.student?.fullName}
                </h3>
                <button
                  onClick={() => setGradingSub(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                <span className="font-semibold text-slate-700">Bài làm của học sinh:</span>
                <p className="text-slate-800 break-words">{gradingSub.content || '(Chưa có nội dung)'}</p>
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Điểm số (Thang điểm 0 - 10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.25}
                    required
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Lời phê / Nhận xét của Thầy/Cô</label>
                  <textarea
                    rows={3}
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="VD: Bài làm tốt, cần chú ý bước xét dấu..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGrading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGrading ? 'Đang lưu...' : 'Lưu kết quả chấm điểm'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: GIA HẠN DEADLINE */}
        {extendingAsg && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Gia hạn bài tập</h3>
                <button
                  onClick={() => setExtendingAsg(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExtendSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Gia hạn cho đối tượng nào?</label>
                  <select
                    value={extendStudentId || ''}
                    onChange={(e) => setExtendStudentId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  >
                    <option value="">Gia hạn chung cho cả lớp</option>
                    {selectedClass?.members
                      ?.filter((m) => m.roleInClass === 'STUDENT')
                      .map((m) => (
                        <option key={m.userId} value={m.userId}>
                          Riêng: {m.user?.fullName} ({m.user?.studentCode})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Hạn nộp mới</label>
                  <input
                    type="datetime-local"
                    required
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Lý do gia hạn</label>
                  <input
                    type="text"
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    placeholder="VD: Học sinh xin nghỉ ốm, thi đấu giải..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isExtending || !extendDate}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isExtending ? 'Đang xử lý...' : 'Xác nhận gia hạn'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
