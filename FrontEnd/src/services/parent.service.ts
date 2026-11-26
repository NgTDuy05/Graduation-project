import { api } from './api';
import { UserStats } from '../types/auth';

export interface LinkedChildSummary {
  linkId: number;
  relationship: string;
  linkedAt: string;
  student: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    studentCode: string;
    avatarUrl?: string | null;
    stats: UserStats;
  };
}

export interface ChildOverviewResponse {
  relationship: string;
  student: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    studentCode: string;
    planType: 'FREE' | 'PRO';
    stats: UserStats;
  };
  summary: {
    totalClasses: number;
    totalAssignments: number;
    submittedAssignments: number;
    overdueAssignments: number;
    completedLessons: number;
    totalFlashcardsLearned: number;
    totalExamsTaken: number;
    averageScore: number | null;
  };
  classes: Array<{
    id: number;
    name: string;
    grade: number;
    subject: string;
    classCode: string;
    teacherName: string;
  }>;
  assignments: Array<{
    id: number;
    title: string;
    className: string;
    subject: string;
    deadline: string;
    status: 'CHUA_LAM' | 'DANG_LAM' | 'DA_NOP' | 'QUA_HAN';
    score: number | null;
    feedback: string | null;
    submittedAt: string | null;
    gradedAt: string | null;
  }>;
  studyProgress: Array<{
    lessonId: string;
    courseSlug: string;
    courseTitle: string;
    subject: string;
    completedTheory: boolean;
    learnedFlashcardsCount: number;
    practiceScore: number;
    wrongQuestionsCount: number;
  }>;
  examAttempts: Array<{
    _id: string;
    examId: string;
    examTitle: string;
    score: number;
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    durationSeconds: number;
    completedAt: string;
  }>;
  announcements: Array<{
    _id: string;
    classId: number;
    className: string;
    title: string;
    content: string;
    authorName: string;
    isPinned: boolean;
    createdAt: string;
  }>;
}

export const parentService = {
  async getLinkedChildren(): Promise<LinkedChildSummary[]> {
    const res = await api.get<LinkedChildSummary[]>('/parent/children');
    return res.data;
  },

  async linkChild(
    studentCode: string,
    relationship?: string,
  ): Promise<{ message: string; linkId: number }> {
    const res = await api.post('/parent/children/link', {
      studentCode,
      relationship,
    });
    return res.data;
  },

  async unlinkChild(studentId: number): Promise<{ message: string }> {
    const res = await api.delete(`/parent/children/${studentId}`);
    return res.data;
  },

  async getChildOverview(studentId: number): Promise<ChildOverviewResponse> {
    const res = await api.get<ChildOverviewResponse>(
      `/parent/children/${studentId}/overview`,
    );
    return res.data;
  },
};

