'use client';

import React from 'react';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { School, Sparkles } from 'lucide-react';

export default function ClassesPage() {
  return (
    <StudentLayout pageTitle="Lớp học trực tuyến">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
          <School className="w-3.5 h-3.5" />
          <span>Module Lớp học</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Danh sách lớp học của bạn</h2>
        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
          Nơi học sinh tham gia lớp học bằng mã lớp, xem danh sách bài tập được giao, hạn nộp bài tập và kết quả bài làm sẽ được triển khai trong <strong>Giai đoạn 5</strong>.
        </p>
      </div>
    </StudentLayout>
  );
}
