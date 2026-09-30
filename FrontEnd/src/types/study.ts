export interface LessonOutline {
  lessonId: string;
  title: string;
  durationMinutes: number;
  order: number;
}

export interface ChapterOutline {
  chapterId: string;
  title: string;
  order: number;
  lessons: LessonOutline[];
}

export interface Course {
  _id?: string;
  slug: string;
  title: string;
  subject: string;
  grade: number;
  thumbnail: string;
  description: string;
  totalLessons: number;
  chapters: ChapterOutline[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FlashcardItem {
  id: string;
  term: string;
  definition: string;
  example?: string;
  difficulty?: string;
}

export interface PracticeQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  _id?: string;
  lessonId: string;
  courseSlug: string;
  chapterId: string;
  title: string;
  order: number;
  theoryContent: string;
  videoUrl?: string;
  summary: string[];
  flashcards: FlashcardItem[];
  practiceQuestions: PracticeQuestionItem[];
}

export interface UserProgress {
  userId: number;
  lessonId: string;
  courseSlug: string;
  completedTheory: boolean;
  learnedFlashcardIds: string[];
  practiceScore: number;
  wrongQuestionIds: string[];
}

export interface CourseDetailResponse {
  course: Course;
  progressList: UserProgress[];
}

export interface LessonDetailResponse {
  lesson: Lesson;
  userProgress?: UserProgress | null;
}

export interface SaveProgressPayload {
  courseSlug: string;
  completedTheory?: boolean;
  learnedFlashcardIds?: string[];
  practiceScore?: number;
  wrongQuestionIds?: string[];
}
