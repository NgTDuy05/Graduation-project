import { User } from './auth';

export type SubmissionStatus = 'CHUA_LAM' | 'DANG_LAM' | 'DA_NOP' | 'QUA_HAN';

export interface AssignmentExtension {
  id: number;
  assignmentId: number;
  studentId: number | null;
  extendedDeadline: string;
  reason?: string;
  createdAt: string;
  student?: User | null;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  status: SubmissionStatus;
  content?: string;
  score?: number | null;
  feedback?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
  student?: User;
}

export interface Assignment {
  id: number;
  classId: number;
  title: string;
  description?: string;
  deadline: string;
  allowLateSubmission: boolean;
  createdBy: number;
  createdAt: string;
  extensions?: AssignmentExtension[];
  submissions?: AssignmentSubmission[];
}

export interface ClassMember {
  id: number;
  classId: number;
  userId: number;
  roleInClass: 'STUDENT' | 'TEACHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  joinedAt: string;
  user?: User;
}

export interface ClassItem {
  id: number;
  name: string;
  grade: number;
  subject: string;
  classCode: string;
  description?: string;
  teacherId: number;
  teacher?: User;
  members?: ClassMember[];
  assignments?: Assignment[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassDetailResponse {
  class: ClassItem;
  studentSubmissions: AssignmentSubmission[];
}
