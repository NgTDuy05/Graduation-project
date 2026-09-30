import Link from 'next/link';
import { Sparkles, ArrowRight, BookOpen, Users, Award } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-blue-50 via-white to-slate-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Unilearn - Nền tảng học thông minh</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Học tập hiệu quả từ <span className="text-blue-600">Lớp 6 đến Lớp 12</span>
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed">
          Nền tảng kết nối học sinh, giáo viên với bài giảng trực quan, thẻ ghi nhớ thông minh, ngân hàng đề thi và phòng học trực tuyến thời gian thực.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            Đăng nhập ngay
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium shadow-sm transition-all"
          >
            Đăng ký tài khoản
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-10 border-t border-slate-200/80">
          <div className="flex flex-col items-center p-3">
            <BookOpen className="w-6 h-6 text-blue-600 mb-1" />
            <span className="text-sm font-bold text-slate-800">Kiến thức chuẩn</span>
            <span className="text-xs text-slate-500">Chương trình SGK</span>
          </div>
          <div className="flex flex-col items-center p-3">
            <Users className="w-6 h-6 text-indigo-600 mb-1" />
            <span className="text-sm font-bold text-slate-800">Lớp học tương tác</span>
            <span className="text-xs text-slate-500">Chat & Bài tập Realtime</span>
          </div>
          <div className="flex flex-col items-center p-3">
            <Award className="w-6 h-6 text-amber-500 mb-1" />
            <span className="text-sm font-bold text-slate-800">Luyện đề thông minh</span>
            <span className="text-xs text-slate-500">Chấm điểm & Phân tích</span>
          </div>
        </div>
      </div>
    </main>
  );
}
