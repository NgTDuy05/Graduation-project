import { api } from './api';
import {
  ClassItem,
  ClassDetailResponse,
  Assignment,
  AssignmentSubmission,
} from '../types/class';
import { User } from '../types/auth';

export const classService = {
  /**
   * Giáo viên tạo lớp học mới
   */
  async createClass(payload: {
    name: string;
    grade: number;
    subject: string;
    description?: string;
  }): Promise<ClassItem> {
    const res = await api.post<ClassItem>('/classes', payload);
    return res.data;
  },

  /**
   * Lấy danh sách lớp giáo viên phụ trách
   */
  async getTeacherClasses(): Promise<ClassItem[]> {
    const res = await api.get<ClassItem[]>('/classes/teacher');
    return res.data;
  },

  /**
   * Lấy danh sách lớp học sinh đã tham gia
   */
  async getStudentClasses(): Promise<ClassItem[]> {
    const res = await api.get<ClassItem[]>('/classes/student');
    return res.data;
  },

  /**
   * Lấy chi tiết một lớp học
   */
  async getClassById(classId: number): Promise<ClassDetailResponse> {
    const res = await api.get<ClassDetailResponse>(`/classes/${classId}`);
    return res.data;
  },

  /**
   * Học sinh tham gia lớp bằng mã lớp 8 ký tự
   */
  async joinClass(classCode: string): Promise<{ message: string; class: ClassItem }> {
    const res = await api.post('/classes/join', { classCode });
    return res.data;
  },

  /**
   * Giáo viên thêm học sinh bằng mã 6 ký tự
   */
  async addStudentByCode(
    classId: number,
    studentCode: string,
  ): Promise<{ message: string; student: User }> {
    const res = await api.post(`/classes/${classId}/students`, { studentCode });
    return res.data;
  },

  /**
   * Giáo viên xoá học sinh khỏi lớp
   */
  async removeStudent(
    classId: number,
    memberId: number,
  ): Promise<{ message: string }> {
    const res = await api.delete(`/classes/${classId}/members/${memberId}`);
    return res.data;
  },

  /**
   * Giáo viên giao bài tập mới
   */
  async createAssignment(
    classId: number,
    payload: {
      title: string;
      description?: string;
      deadline: string;
      allowLateSubmission?: boolean;
    },
  ): Promise<Assignment> {
    const res = await api.post<Assignment>(`/classes/${classId}/assignments`, payload);
    return res.data;
  },

  /**
   * Giáo viên gia hạn deadline
   */
  async extendDeadline(
    assignmentId: number,
    payload: {
      extendedDeadline: string;
      reason?: string;
      studentId?: number;
    },
  ): Promise<{ message: string }> {
    const res = await api.post(`/classes/assignments/${assignmentId}/extensions`, payload);
    return res.data;
  },

  /**
   * Học sinh nộp bài tập
   */
  async submitAssignment(
    assignmentId: number,
    content: string,
  ): Promise<{ message: string; submission: AssignmentSubmission }> {
    const res = await api.post(`/classes/assignments/${assignmentId}/submit`, { content });
    return res.data;
  },

  /**
   * Giáo viên xem danh sách bài nộp và thống kê
   */
  async getAssignmentSubmissions(assignmentId: number): Promise<{
    assignment: Assignment;
    stats: {
      total: number;
      submitted: number;
      late: number;
      pending: number;
      graded: number;
    };
    submissions: AssignmentSubmission[];
  }> {
    const res = await api.get(`/classes/assignments/${assignmentId}/submissions`);
    return res.data;
  },

  /**
   * Giáo viên chấm điểm bài nộp
   */
  async gradeSubmission(
    submissionId: number,
    payload: { score: number; feedback?: string },
  ): Promise<{ message: string; submission: AssignmentSubmission }> {
    const res = await api.post(`/classes/submissions/${submissionId}/grade`, payload);
    return res.data;
  },
};
