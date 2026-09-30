'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StudentLayout } from '../../../../components/layout/StudentLayout';
import { studyService } from '../../../../services/study.service';
import { useAuth } from '../../../../contexts/AuthContext';
import { Course, UserProgress } from '../../../../types/study';
import {
  BookOpen,
  Layers,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  PlayCircle,
  FileCheck2,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [progressList, setProgressList] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const data = await studyService.getCourseBySlug(courseSlug, user?.id);
        setCourse(data.course);
        setProgressList(data.progressList || []);
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };

    if (courseSlug) {
      fetchCourseDetail();
    }
  }, [courseSlug, user?.id]);

  if (isLoading) {
    return (
      <StudentLayout pageTitle="Chi tiết khoá học">
        <div className="py-20 text-center text-sm text-slate-400">
          Đang tải nội dung khoá học...
        </div>
      </StudentLayout>
    );
  }

  if (!course) {
    return (
      <StudentLayout pageTitle="Không tìm thấy khoá học">
        <div className="bg-white rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-12 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Khoá học không tồn tại</h2>
          <Link
            href="/student/study"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle={course.title}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/student/study" className="hover:text-blue-600 flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Khoá học</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate">{course.title}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                Lớp {course.grade}
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                Môn {course.subject}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {course.description}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>{course.chapters?.length || 1} Chương</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>{course.totalLessons || 2} Bài học</span>
              </span>
            </div>
          </div>
        </div>

        {/* Chapters Outline */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Mục lục bài học theo chương
          </h2>

          <div className="space-y-4">
            {course.chapters?.map((chapter) => (
              <div
                key={chapter.chapterId}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs"
              >
                {/* Chapter Title Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      {chapter.order}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {chapter.title}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {chapter.lessons?.length || 0} bài học
                  </span>
                </div>

                {/* Lesson List */}
                <div className="divide-y divide-slate-100">
                  {chapter.lessons?.map((lesson) => {
                    const progress = progressList.find((p) => p.lessonId === lesson.lessonId);
                    const isCompleted = progress?.completedTheory && progress?.practiceScore > 0;

                    return (
                      <div
                        key={lesson.lessonId}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.durationMinutes} phút</span>
                              </span>
                              <span>•</span>
                              <span>4 phần (Lý thuyết, Thẻ từ, Bài tập, Lỗi sai)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Link
                            href={`/student/study/${course.slug}/lesson/${lesson.lessonId}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Vào học bài</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
