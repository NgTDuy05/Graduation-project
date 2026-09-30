'use client';

import React from 'react';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { Target } from 'lucide-react';

export default function PracticePage() {
  return (
    <StudentLayout pageTitle="Ôn luyện & Luyện đề">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
          <Target className="w-3.5 h-3.5" />
          <span>Module Ôn luyện trắc nghiệm</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Ngân hàng đề thi và luyện tập</h2>
        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
          Cấu hình đề thi theo môn, thời gian làm bài, thi thử có đếm ngược và phân tích đáp án chi tiết sẽ được xây dựng trong <strong>Giai đoạn 7</strong>.
        </p>
      </div>
    </StudentLayout>
  );
}
