'use client';

import React from 'react';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <StudentLayout pageTitle="Tin nhắn & Trao đổi">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Module Chat Realtime & Thông báo</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Phòng chat lớp học thời gian thực</h2>
        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
          Trao đổi bài vở với thầy cô và các bạn qua Socket.IO Gateway, có trạng thái trực tuyến và thông báo nhấp nháy sẽ được hoàn thiện trong <strong>Giai đoạn 6</strong>.
        </p>
      </div>
    </StudentLayout>
  );
}
