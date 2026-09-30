'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { studyService } from '../../../services/study.service';
import { Course } from '../../../types/study';
import {
  BookOpen,
  Filter,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  Search,
  CheckCircle,
} from 'lucide-react';

export default function StudyCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const grades = [
    { label: 'Tất cả khối lớp', value: null },
    { label: 'Lớp 12', value: 12 },
    { label: 'Lớp 11', value: 11 },
    { label: 'Lớp 10', value: 10 },
    { label: 'Lớp 9', value: 9 },
    { label: 'Lớp 8', value: 8 },
    { label: 'Lớp 7', value: 7 },
    { label: 'Lớp 6', value: 6 },
  ];

  const subjects = [
    'Tất cả',
    'Toán',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Tiếng Anh',
    'Ngữ văn',
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const data = await studyService.getCourses(
          selectedGrade || undefined,
          selectedSubject,
        );
        setCourses(data);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [selectedGrade, selectedSubject]);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StudentLayout pageTitle="Khoá học & Bài giảng">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kho học liệu chất lượng cao từ Lớp 6 đến Lớp 12</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Khám Phá Bài Học Trọng Tâm
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              Lựa chọn khối lớp và môn học của bạn để tiếp cận kiến thức chuẩn SGK, luyện thẻ ghi nhớ và làm bài tập trắc nghiệm củng cố ngay.
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          {/* Grade filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 pl-1 pr-2 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Khối lớp:</span>
            </span>
            {grades.map((g) => (
              <button
                key={g.label}
                onClick={() => setSelectedGrade(g.value)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGrade === g.value
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Subject filter and search row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Subject pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài học, chủ đề..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div>
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Đang tải danh sách khoá học...
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.slug}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                          Lớp {course.grade}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold">
                          {course.subject}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {course.description}
                      </p>

                      <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          <span>{course.chapters?.length || 1} chương</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{course.totalLessons || 2} bài học</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-5 pt-0">
                    <Link
                      href={`/student/study/${course.slug}`}
                      className="w-full py-2.5 px-4 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                    >
                      <span>Vào học ngay</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">Không tìm thấy môn học phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy thử thay đổi khối lớp hoặc bộ lọc môn học để xem các bài giảng có sẵn.
              </p>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
