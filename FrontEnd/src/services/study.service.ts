import { api } from './api';
import {
  Course,
  CourseDetailResponse,
  LessonDetailResponse,
  SaveProgressPayload,
} from '../types/study';

export const studyService = {
  /**
   * Lấy danh sách các khoá học
   */
  async getCourses(grade?: number, subject?: string): Promise<Course[]> {
    const params = new URLSearchParams();
    if (grade) params.append('grade', grade.toString());
    if (subject && subject !== 'Tất cả') params.append('subject', subject);

    const response = await api.get<Course[]>(`/study/courses?${params.toString()}`);
    return response.data;
  },

  /**
   * Lấy chi tiết khoá học theo Slug
   */
  async getCourseBySlug(slug: string, userId?: number): Promise<CourseDetailResponse> {
    const url = userId ? `/study/courses/${slug}?userId=${userId}` : `/study/courses/${slug}`;
    const response = await api.get<CourseDetailResponse>(url);
    return response.data;
  },

  /**
   * Lấy chi tiết bài học theo ID
   */
  async getLessonById(lessonId: string, userId?: number): Promise<LessonDetailResponse> {
    const url = userId ? `/study/lessons/${lessonId}?userId=${userId}` : `/study/lessons/${lessonId}`;
    const response = await api.get<LessonDetailResponse>(url);
    return response.data;
  },

  /**
   * Cập nhật tiến độ học bài
   */
  async saveProgress(
    lessonId: string,
    payload: SaveProgressPayload,
  ): Promise<{ message: string; bonusXP: number }> {
    const response = await api.post(`/study/lessons/${lessonId}/progress`, payload);
    return response.data;
  },

  /**
   * Hỏi đáp Gia sư AI Unilearn
   */
  async askTutor(payload: {
    lessonId: string;
    question: string;
    lessonTitle?: string;
  }): Promise<{ tutorName: string; response: string }> {
    const response = await api.post('/study/ai-tutor', payload);
    return response.data;
  },
};
