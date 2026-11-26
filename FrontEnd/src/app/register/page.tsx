'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import {
  Sparkles,
  Lock,
  User as UserIcon,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  GraduationCap,
  School,
  HeartHandshake,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<UserRole>('HOC_SINH');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal hiển thị mã học sinh sau khi đăng ký thành công
  const [createdStudentCode, setCreatedStudentCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên');
      return;
    }

    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên người dùng');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      setErrorMsg('Tên người dùng phải từ 3-30 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới');
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Mật khẩu phải có tối thiểu 8 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role,
      });

      // Nếu là học sinh: hiển thị modal mã học sinh vừa sinh
      if (response.user.role === 'HOC_SINH' && response.user.studentCode) {
        setCreatedStudentCode(response.user.studentCode);
      } else if (response.user.role === 'GIAO_VIEN') {
        router.push('/teacher');
      } else {
        router.push('/parent');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const message =
        error.response?.data?.message ||
        'Đăng ký tài khoản không thành công. Vui lòng thử lại!';
      setErrorMsg(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyStudentCode = () => {
    if (createdStudentCode) {
      navigator.clipboard.writeText(createdStudentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4 md:p-8">
      {/* Background decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* MODAL CHÚC MỪNG & HIỂN THỊ MÃ HỌC SINH */}
      {createdStudentCode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-blue-100 text-center space-y-6 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Đăng Ký Thành Công! 🎉
              </h2>
              <p className="text-sm text-slate-600">
                Tài khoản Học sinh của bạn đã sẵn sàng. Dưới đây là <strong>Mã học sinh</strong> duy nhất của bạn:
              </p>
            </div>

            {/* Khung Mã Học Sinh */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 rounded-2xl text-white shadow-lg shadow-blue-500/25">
              <div className="text-xs uppercase tracking-widest text-blue-100 font-semibold mb-1">
                Mã Định Danh Học Sinh
              </div>
              <div className="text-3xl font-extrabold tracking-widest font-mono select-all">
                {createdStudentCode}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={copyStudentCode}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-medium transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Đã sao chép vào bộ nhớ tạm!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép mã</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              💡 <strong>Lưu ý:</strong> Hãy gửi mã này cho Giáo viên để được thêm vào lớp học trực tuyến nhé. Bạn cũng có thể xem lại mã bất kỳ lúc nào trên góc thông tin cá nhân.
            </p>

            <button
              type="button"
              onClick={() => router.push('/student')}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Vào trang học tập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Register Box */}
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-500/5 border border-slate-100 p-6 sm:p-8 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-2 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SmartLearn • Học thông minh</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tạo tài khoản SmartLearn
          </h1>
          <p className="text-sm text-slate-500">
            Chọn vai trò phù hợp và bắt đầu trải nghiệm ngay hôm nay
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <div className="leading-snug">{errorMsg}</div>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="mb-6 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Bạn tham gia với tư cách:
          </label>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Học sinh */}
            <button
              type="button"
              onClick={() => setRole('HOC_SINH')}
              className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                role === 'HOC_SINH'
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                  role === 'HOC_SINH' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xs sm:text-sm">Học sinh</span>
              <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Lớp 6 - 12</span>
            </button>

            {/* Giáo viên */}
            <button
              type="button"
              onClick={() => setRole('GIAO_VIEN')}
              className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                role === 'GIAO_VIEN'
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                  role === 'GIAO_VIEN' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <School className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xs sm:text-sm">Giáo viên</span>
              <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Quản lý lớp</span>
            </button>

            {/* Phụ huynh */}
            <button
              type="button"
              onClick={() => setRole('PHU_HUYNH')}
              className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                role === 'PHU_HUYNH'
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                  role === 'PHU_HUYNH' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xs sm:text-sm">Phụ huynh</span>
              <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Đồng hành</span>
            </button>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Họ và tên</label>
            <div className="relative rounded-2xl">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Tên người dùng</label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nguyenvana"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Email</label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Mật khẩu (≥ 8 ký tự)</label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Xác nhận mật khẩu</label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-2xl shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xử lý đăng ký...</span>
              </>
            ) : (
              <>
                <span>Đăng ký ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  );
}
