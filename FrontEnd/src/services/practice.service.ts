import { api } from './api';
import {
  Exam,
  ExamAttempt,
  SubmitExamResponse,
  AttemptDetailResponse,
} from '../types/practice';

export const practiceService = {
  /**
   * Lấy danh sách đề thi
   */
  async getExams(grade?: number, subject?: string): Promise<Exam[]> {
    const params = new URLSearchParams();
    if (grade) params.append('grade', grade.toString());
    if (subject && subject !== 'Tất cả') params.append('subject', subject);

    const res = await api.get<Exam[]>(`/practice/exams?${params.toString()}`);
    return res.data;
  },

  /**
   * Lấy chi tiết đề thi để chuẩn bị làm bài
   */
  async getExamById(examId: string): Promise<Exam> {
    const res = await api.get<Exam>(`/practice/exams/${examId}`);
    return res.data;
  },

  /**
   * Nộp bài thi
   */
  async submitExam(
    examId: string,
    answers: Record<string, number>,
    durationSeconds: number,
  ): Promise<SubmitExamResponse> {
    const res = await api.post<SubmitExamResponse>(`/practice/exams/${examId}/submit`, {
      answers,
      durationSeconds,
    });
    return res.data;
  },

  /**
   * Lấy lịch sử thi của học sinh
   */
  async getAttemptsHistory(): Promise<ExamAttempt[]> {
    const res = await api.get<ExamAttempt[]>('/practice/history');
    return res.data;
  },

  /**
   * Xem lại chi tiết một bài thi đã nộp
   */
  async getAttemptDetail(attemptId: string): Promise<AttemptDetailResponse> {
    const res = await api.get<AttemptDetailResponse>(`/practice/attempts/${attemptId}`);
    return res.data;
  },
};
