'use client';

import React from 'react';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { BookOpen, Layers, Sparkles } from 'lucide-react';

export default function StudyPage() {
  return (
    <StudentLayout pageTitle="Học bài theo môn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Module Học bài (Lớp 6 - 12)</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Khám phá khoá học & bài giảng</h2>
        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
          Module này sẽ bao gồm danh sách môn học, chương mục chi tiết, bài học 4 phần (Lý thuyết, Flashcard ghép cặp, Bài tập, Ôn lại lỗi sai) và Drawer Gia sư AI sẽ được hoàn thiện toàn diện trong <strong>Giai đoạn 4</strong>.
        </p>
      </div>
    </StudentLayout>
  );
}
