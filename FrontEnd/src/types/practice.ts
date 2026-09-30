export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
  difficulty?: string;
}

export interface Exam {
  _id?: string;
  examId: string;
  title: string;
  subject: string;
  grade: number;
  durationMinutes: number;
  totalQuestions: number;
  description: string;
  questions: ExamQuestion[];
}

export interface ExamAttempt {
  _id: string;
  userId: number;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  durationSeconds: number;
  answers: Record<string, number>;
  completedAt: string;
}

export interface QuestionAnalysis {
  questionId: string;
  question: string;
  options: string[];
  studentChoice: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface SubmitExamResponse {
  message: string;
  attemptId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  durationSeconds: number;
  bonusXP: number;
  analysis: QuestionAnalysis[];
}

export interface AttemptDetailResponse {
  attempt: ExamAttempt;
  analysis: QuestionAnalysis[];
}
