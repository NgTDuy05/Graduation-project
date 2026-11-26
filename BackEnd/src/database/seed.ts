import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User, UserRole } from '../modules/users/entities/user.entity';
import { UserStats } from '../modules/users/entities/user-stats.entity';
import { Class } from '../modules/classes/entities/class.entity';
import { ClassMember } from '../modules/classes/entities/class-member.entity';
import { Assignment } from '../modules/classes/entities/assignment.entity';
import {
  AssignmentSubmission,
  SubmissionStatus,
} from '../modules/classes/entities/assignment-submission.entity';
import { AssignmentExtension } from '../modules/classes/entities/assignment-extension.entity';
import {
  Subscription,
  PlanType,
} from '../modules/subscriptions/entities/subscription.entity';
import { ParentStudentLink } from '../modules/parent/entities/parent-student-link.entity';
import { Course, CourseDocument } from '../modules/study/schemas/course.schema';
import { Lesson, LessonDocument } from '../modules/study/schemas/lesson.schema';
import {
  UserProgress,
  UserProgressDocument,
} from '../modules/study/schemas/user-progress.schema';
import { Exam, ExamDocument } from '../modules/practice/schemas/exam.schema';
import {
  ExamAttempt,
  ExamAttemptDocument,
} from '../modules/practice/schemas/exam-attempt.schema';
import {
  ChatMessage,
  ChatMessageDocument,
} from '../modules/chat/schemas/chat-message.schema';
import {
  Announcement,
  AnnouncementDocument,
} from '../modules/chat/schemas/announcement.schema';

async function bootstrapSeed() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu Unilearn (MySQL + MongoDB)...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const statsRepo = app.get<Repository<UserStats>>(getRepositoryToken(UserStats));
    const classRepo = app.get<Repository<Class>>(getRepositoryToken(Class));
    const memberRepo = app.get<Repository<ClassMember>>(getRepositoryToken(ClassMember));
    const assignmentRepo = app.get<Repository<Assignment>>(getRepositoryToken(Assignment));
    const submissionRepo = app.get<Repository<AssignmentSubmission>>(
      getRepositoryToken(AssignmentSubmission),
    );
    const extensionRepo = app.get<Repository<AssignmentExtension>>(
      getRepositoryToken(AssignmentExtension),
    );
    const subscriptionRepo = app.get<Repository<Subscription>>(
      getRepositoryToken(Subscription),
    );
    const parentLinkRepo = app.get<Repository<ParentStudentLink>>(
      getRepositoryToken(ParentStudentLink),
    );

    const courseModel = app.get<Model<CourseDocument>>(getModelToken(Course.name));
    const lessonModel = app.get<Model<LessonDocument>>(getModelToken(Lesson.name));
    const progressModel = app.get<Model<UserProgressDocument>>(
      getModelToken(UserProgress.name),
    );
    const examModel = app.get<Model<ExamDocument>>(getModelToken(Exam.name));
    const attemptModel = app.get<Model<ExamAttemptDocument>>(
      getModelToken(ExamAttempt.name),
    );
    const chatModel = app.get<Model<ChatMessageDocument>>(
      getModelToken(ChatMessage.name),
    );
    const announcementModel = app.get<Model<AnnouncementDocument>>(
      getModelToken(Announcement.name),
    );

    const hashedPassword = await bcrypt.hash('123456', 10);

    // =========================================================================
    // 1. SEED USERS & STATS (MySQL)
    // =========================================================================
    const upsertUser = async (data: {
      username: string;
      email: string;
      fullName: string;
      role: UserRole;
      studentCode?: string | null;
      stats?: { streakDays: number; lightningPoints: number; rankTier: string };
      planType?: PlanType;
    }): Promise<User> => {
      let user = await userRepo.findOne({ where: { email: data.email } });
      if (!user) {
        user = userRepo.create({
          username: data.username,
          email: data.email,
          password: hashedPassword,
          fullName: data.fullName,
          role: data.role,
          studentCode: data.studentCode ?? null,
        });
        user = await userRepo.save(user);
      }

      if (data.role === UserRole.HOC_SINH && data.stats) {
        let stats = await statsRepo.findOne({ where: { userId: user.id } });
        if (!stats) {
          stats = statsRepo.create({
            userId: user.id,
            streakDays: data.stats.streakDays,
            lightningPoints: data.stats.lightningPoints,
            rankTier: data.stats.rankTier,
            lastActiveDate: new Date(),
          });
          await statsRepo.save(stats);
        }
      }

      const existingSub = await subscriptionRepo.findOne({
        where: { userId: user.id, isActive: true },
      });
      if (!existingSub) {
        const plan = data.planType || PlanType.FREE;
        const endDate =
          plan === PlanType.PRO
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null;
        await subscriptionRepo.save(
          subscriptionRepo.create({
            userId: user.id,
            planType: plan,
            startDate: new Date(),
            endDate,
            isActive: true,
          }),
        );
      }

      return user;
    };

    const teacher1 = await upsertUser({
      username: 'giaovien',
      email: 'giaovien@unilearn.edu.vn',
      fullName: 'Thầy Nguyễn Minh Tuấn',
      role: UserRole.GIAO_VIEN,
      planType: PlanType.PRO,
    });

    const teacher2 = await upsertUser({
      username: 'cothuhuong',
      email: 'cothuhuong@unilearn.edu.vn',
      fullName: 'Cô Trần Thu Hương',
      role: UserRole.GIAO_VIEN,
      planType: PlanType.FREE,
    });

    const student1 = await upsertUser({
      username: 'hocsinh',
      email: 'hocsinh@unilearn.edu.vn',
      fullName: 'Nguyễn Hoàng Anh',
      role: UserRole.HOC_SINH,
      studentCode: 'HS2026',
      stats: { streakDays: 7, lightningPoints: 320, rankTier: 'Vàng' },
      planType: PlanType.PRO,
    });

    const student2 = await upsertUser({
      username: 'minhkhoa',
      email: 'minhkhoa@unilearn.edu.vn',
      fullName: 'Lê Minh Khoa',
      role: UserRole.HOC_SINH,
      studentCode: 'MK1208',
      stats: { streakDays: 14, lightningPoints: 580, rankTier: 'Kim Cương' },
      planType: PlanType.PRO,
    });

    const student3 = await upsertUser({
      username: 'thaochi',
      email: 'thaochi@unilearn.edu.vn',
      fullName: 'Phạm Thảo Chi',
      role: UserRole.HOC_SINH,
      studentCode: 'TC0912',
      stats: { streakDays: 5, lightningPoints: 210, rankTier: 'Bạc' },
      planType: PlanType.FREE,
    });

    const student4 = await upsertUser({
      username: 'baolong',
      email: 'baolong@unilearn.edu.vn',
      fullName: 'Vũ Bảo Long',
      role: UserRole.HOC_SINH,
      studentCode: 'BL2009',
      stats: { streakDays: 3, lightningPoints: 95, rankTier: 'Đồng' },
      planType: PlanType.FREE,
    });

    const parent1 = await upsertUser({
      username: 'phuhuynh',
      email: 'phuhuynh@unilearn.edu.vn',
      fullName: 'Phụ huynh Hoàng Văn Nam',
      role: UserRole.PHU_HUYNH,
      planType: PlanType.FREE,
    });

    // Liên kết phụ huynh -> học sinh chính
    const existingLink = await parentLinkRepo.findOne({
      where: { parentId: parent1.id, studentId: student1.id },
    });
    if (!existingLink) {
      await parentLinkRepo.save(
        parentLinkRepo.create({
          parentId: parent1.id,
          studentId: student1.id,
          relationship: 'Bố',
        }),
      );
    }

    console.log('✅ Đã seed tài khoản mẫu (Giáo viên, Học sinh, Phụ huynh) & Subscriptions.');

    // =========================================================================
    // 2. SEED CLASSES, MEMBERS, ASSIGNMENTS & SUBMISSIONS (MySQL)
    // =========================================================================
    const upsertClass = async (data: {
      name: string;
      grade: number;
      subject: string;
      classCode: string;
      description: string;
      teacherId: number;
      students: User[];
    }): Promise<Class> => {
      let cls = await classRepo.findOne({ where: { classCode: data.classCode } });
      if (!cls) {
        cls = await classRepo.save(
          classRepo.create({
            name: data.name,
            grade: data.grade,
            subject: data.subject,
            classCode: data.classCode,
            description: data.description,
            teacherId: data.teacherId,
          }),
        );
      }

      // Add teacher member
      const teacherMember = await memberRepo.findOne({
        where: { classId: cls.id, userId: data.teacherId },
      });
      if (!teacherMember) {
        await memberRepo.save(
          memberRepo.create({
            classId: cls.id,
            userId: data.teacherId,
            roleInClass: 'TEACHER',
            status: 'APPROVED',
          }),
        );
      }

      // Add student members
      for (const st of data.students) {
        const existMem = await memberRepo.findOne({
          where: { classId: cls.id, userId: st.id },
        });
        if (!existMem) {
          await memberRepo.save(
            memberRepo.create({
              classId: cls.id,
              userId: st.id,
              roleInClass: 'STUDENT',
              status: 'APPROVED',
            }),
          );
        }
      }

      return cls;
    };

    const classToan12 = await upsertClass({
      name: 'Toán Học 12A1 - Ôn Thi THPT 2026',
      grade: 12,
      subject: 'Toán',
      classCode: 'TOAN12A1',
      description: 'Lớp ôn luyện chuyên đề Giải tích & Hình học Oxyz hướng tới kỳ thi Tốt nghiệp THPT.',
      teacherId: teacher1.id,
      students: [student1, student2, student3, student4],
    });

    const classVatLy9 = await upsertClass({
      name: 'Vật Lý 9B - Điện Học Thực Hành',
      grade: 9,
      subject: 'Vật lý',
      classCode: 'VATLY09B',
      description: 'Bồi dưỡng kiến thức Định luật Ôm, công suất điện và giải bài tập mạch điện.',
      teacherId: teacher1.id,
      students: [student1, student4],
    });

    const classAnh10 = await upsertClass({
      name: 'Tiếng Anh 10 - Global Success',
      grade: 10,
      subject: 'Tiếng Anh',
      classCode: 'ENG10GS1',
      description: 'Rèn luyện từ vựng, ngữ pháp trọng tâm và kỹ năng đọc hiểu THPT.',
      teacherId: teacher2.id,
      students: [student1, student2, student3],
    });

    // Helper seed assignment + submissions
    const upsertAssignment = async (data: {
      classId: number;
      title: string;
      description: string;
      daysFromNow: number;
      allowLateSubmission: boolean;
      createdBy: number;
      submissions: Array<{
        studentId: number;
        status: SubmissionStatus;
        content?: string;
        score?: number;
        feedback?: string;
      }>;
    }) => {
      let asg = await assignmentRepo.findOne({
        where: { classId: data.classId, title: data.title },
      });

      if (!asg) {
        const deadline = new Date(
          Date.now() + data.daysFromNow * 24 * 60 * 60 * 1000,
        );
        asg = await assignmentRepo.save(
          assignmentRepo.create({
            classId: data.classId,
            title: data.title,
            description: data.description,
            deadline,
            allowLateSubmission: data.allowLateSubmission,
            createdBy: data.createdBy,
          }),
        );

        for (const subData of data.submissions) {
          const isSubmitted =
            subData.status === SubmissionStatus.DA_NOP ||
            subData.status === SubmissionStatus.QUA_HAN;

          await submissionRepo.save(
            submissionRepo.create({
              assignmentId: asg.id,
              studentId: subData.studentId,
              status: subData.status,
              content: subData.content || null,
              score: subData.score ?? null,
              feedback: subData.feedback || null,
              submittedAt: isSubmitted ? new Date(Date.now() - 12 * 3600 * 1000) : null,
              gradedAt: subData.score !== undefined ? new Date() : null,
            }),
          );
        }
      }

      return asg;
    };

    const asgToan1 = await upsertAssignment({
      classId: classToan12.id,
      title: 'Bài tập Tuần 1: Tính đơn điệu & Cực trị hàm số',
      description: 'Hoàn thành 5 câu khảo sát sự biến thiên của hàm bậc 3 và bậc 4 trùng phương, nộp link ảnh bài giải hoặc đáp án chi tiết.',
      daysFromNow: 3,
      allowLateSubmission: true,
      createdBy: teacher1.id,
      submissions: [
        {
          studentId: student1.id,
          status: SubmissionStatus.DA_NOP,
          content: 'Em đã giải đủ 5 câu và kiểm tra bảng biến thiên: Câu 1 đồng biến trên (-∞; 0) và (2; +∞)... Link bài làm chi tiết: https://drive.google.com/unilearn-demo',
          score: 9.25,
          feedback: 'Trình bày rõ ràng, lập bảng biến thiên chính xác!',
        },
        {
          studentId: student2.id,
          status: SubmissionStatus.DA_NOP,
          content: 'Em nộp bài tập tuần 1 môn Toán 12 đầy đủ 5 câu tự luận.',
          score: 9.5,
          feedback: 'Rất xuất sắc, lời giải ngắn gọn và chặt chẽ.',
        },
        {
          studentId: student3.id,
          status: SubmissionStatus.DA_NOP,
          content: 'Em đã hoàn thành phần xét dấu đạo hàm và cực trị cho cả 5 bài tập thầy giao.',
        },
        {
          studentId: student4.id,
          status: SubmissionStatus.CHUA_LAM,
        },
      ],
    });

    await upsertAssignment({
      classId: classToan12.id,
      title: 'Bài tập Tuần 2: Giá trị lớn nhất - nhỏ nhất trên đoạn',
      description: 'Tìm GTLN, GTNN của hàm số trên đoạn [a; b] và bài toán thực tế tối ưu hóa.',
      daysFromNow: 7,
      allowLateSubmission: true,
      createdBy: teacher1.id,
      submissions: [
        { studentId: student1.id, status: SubmissionStatus.CHUA_LAM },
        { studentId: student2.id, status: SubmissionStatus.CHUA_LAM },
        { studentId: student3.id, status: SubmissionStatus.CHUA_LAM },
        { studentId: student4.id, status: SubmissionStatus.CHUA_LAM },
      ],
    });

    await upsertAssignment({
      classId: classVatLy9.id,
      title: 'Thực hành Định luật Ôm & Đo điện trở dây dẫn',
      description: 'Tính cường độ dòng điện trong mạch nối tiếp và song song, giải thích kết quả đo.',
      daysFromNow: 5,
      allowLateSubmission: true,
      createdBy: teacher1.id,
      submissions: [
        {
          studentId: student1.id,
          status: SubmissionStatus.DA_NOP,
          content: 'Bài 1: Rtđ = 30 Ω, I = 0.4 A. Bài 2: Công suất tỏa nhiệt P = 4.8 W.',
        },
        { studentId: student4.id, status: SubmissionStatus.CHUA_LAM },
      ],
    });

    await upsertAssignment({
      classId: classAnh10.id,
      title: 'Unit 1 Writing: Family Routines & Household Chores',
      description: 'Viết đoạn văn 120-150 từ chia sẻ việc phân công việc nhà trong gia đình em.',
      daysFromNow: 4,
      allowLateSubmission: false,
      createdBy: teacher2.id,
      submissions: [
        { studentId: student1.id, status: SubmissionStatus.CHUA_LAM },
        { studentId: student2.id, status: SubmissionStatus.DA_NOP, content: 'In my family, everyone shares household chores equally...', score: 8.75, feedback: 'Good vocabulary and structure!' },
        { studentId: student3.id, status: SubmissionStatus.CHUA_LAM },
      ],
    });

    // Gia hạn mẫu cho Bảo Long
    const existExt = await extensionRepo.findOne({
      where: { assignmentId: asgToan1.id, studentId: student4.id },
    });
    if (!existExt) {
      await extensionRepo.save(
        extensionRepo.create({
          assignmentId: asgToan1.id,
          studentId: student4.id,
          extendedDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          reason: 'Học sinh tham gia đội tuyển thể thao trường',
        }),
      );
    }

    console.log('✅ Đã seed Lớp học, Thành viên, Bài tập & Bài nộp (MySQL).');

    // =========================================================================
    // 3. SEED COURSES & ALL LESSONS (MongoDB)
    // =========================================================================
    const coursesData = [
      {
        slug: 'toan-12-giai-tich',
        title: 'Toán 12 - Giải Tích & Khảo Sát Hàm Số',
        subject: 'Toán',
        grade: 12,
        thumbnail:
          'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
        description:
          'Nắm vững tính đơn điệu, cực trị, giá trị lớn nhất - nhỏ nhất và khảo sát đồ thị hàm số phục vụ kỳ thi Tốt nghiệp THPT.',
        totalLessons: 2,
        chapters: [
          {
            chapterId: 'c1',
            title: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
            order: 1,
            lessons: [
              {
                lessonId: 'toan-12-bai-1',
                title: 'Bài 1: Sự đồng biến, nghịch biến của hàm số',
                durationMinutes: 25,
                order: 1,
              },
              {
                lessonId: 'toan-12-bai-2',
                title: 'Bài 2: Cực trị của hàm số',
                durationMinutes: 30,
                order: 2,
              },
            ],
          },
        ],
      },
      {
        slug: 'tieng-anh-10-global-success',
        title: 'Tiếng Anh 10 - Global Success',
        subject: 'Tiếng Anh',
        grade: 10,
        thumbnail:
          'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
        description:
          'Học từ vựng theo chủ đề, ngữ pháp thì hiện tại đơn vs hiện tại tiếp diễn và kỹ năng giao tiếp tự tin.',
        totalLessons: 1,
        chapters: [
          {
            chapterId: 'unit-1',
            title: 'Unit 1: Family Life',
            order: 1,
            lessons: [
              {
                lessonId: 'ta-10-unit-1',
                title: 'Lesson 1: Vocabulary & Household Chores',
                durationMinutes: 20,
                order: 1,
              },
            ],
          },
        ],
      },
      {
        slug: 'vat-ly-9-dien-hoc',
        title: 'Vật Lý 9 - Điện Học Căn Bản',
        subject: 'Vật lý',
        grade: 9,
        thumbnail:
          'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=600&auto=format&fit=crop&q=80',
        description:
          'Khám phá định luật Ôm, điện trở dây dẫn, công suất điện và định luật Jun-Len-xơ.',
        totalLessons: 1,
        chapters: [
          {
            chapterId: 'vl9-c1',
            title: 'Chương 1: Điện học',
            order: 1,
            lessons: [
              {
                lessonId: 'vl-9-bai-1',
                title: 'Bài 1: Sự phụ thuộc của cường độ dòng điện vào hiệu điện thế',
                durationMinutes: 20,
                order: 1,
              },
            ],
          },
        ],
      },
      {
        slug: 'toan-6-so-hoc',
        title: 'Toán 6 - Số Tự Nhiên & Phép Tính',
        subject: 'Toán',
        grade: 6,
        thumbnail:
          'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
        description:
          'Làm quen với tập hợp, luỹ thừa với số mũ tự nhiên và dấu hiệu chia hết cho 2, 3, 5, 9.',
        totalLessons: 1,
        chapters: [
          {
            chapterId: 't6-c1',
            title: 'Chương 1: Tập hợp các số tự nhiên',
            order: 1,
            lessons: [
              {
                lessonId: 'toan-6-bai-1',
                title: 'Bài 1: Tập hợp và các phần tử của tập hợp',
                durationMinutes: 15,
                order: 1,
              },
            ],
          },
        ],
      },
      {
        slug: 'hoa-hoc-11-can-bang',
        title: 'Hóa Học 11 - Cân Bằng Hóa Học',
        subject: 'Hóa học',
        grade: 11,
        thumbnail:
          'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
        description:
          'Tìm hiểu phản ứng thuận nghịch, hằng số cân bằng Kc và nguyên lý chuyển dịch cân bằng Le Chatelier.',
        totalLessons: 1,
        chapters: [
          {
            chapterId: 'hh11-c1',
            title: 'Chương 1: Cân bằng hóa học',
            order: 1,
            lessons: [
              {
                lessonId: 'hh-11-bai-1',
                title: 'Bài 1: Khái niệm về cân bằng hóa học',
                durationMinutes: 25,
                order: 1,
              },
            ],
          },
        ],
      },
    ];

    for (const c of coursesData) {
      await courseModel.findOneAndUpdate({ slug: c.slug }, { $set: c }, { upsert: true });
    }

    const lessonsData = [
      {
        lessonId: 'toan-12-bai-1',
        courseSlug: 'toan-12-giai-tich',
        chapterId: 'c1',
        title: 'Bài 1: Sự đồng biến, nghịch biến của hàm số',
        order: 1,
        theoryContent: `## 1. Định nghĩa tính đơn điệu của hàm số
Giả sử hàm số $y = f(x)$ xác định trên khoảng $K$:
- Hàm số **đồng biến** trên $K$ nếu $\\forall x_1, x_2 \\in K, x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)$.
- Hàm số **nghịch biến** trên $K$ nếu $\\forall x_1, x_2 \\in K, x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)$.

## 2. Điều kiện đủ bằng đạo hàm
- Nếu $f'(x) > 0$ trên $K$ thì hàm số đồng biến trên $K$.
- Nếu $f'(x) < 0$ trên $K$ thì hàm số nghịch biến trên $K$.
- Định lý mở rộng: $f'(x) \\ge 0$ trên $K$ và $f'(x) = 0$ chỉ tại hữu hạn điểm $\\Rightarrow$ đồng biến trên $K$.`,
        summary: [
          "f'(x) > 0 trên K => Hàm số đồng biến (đồ thị đi lên).",
          "f'(x) < 0 trên K => Hàm số nghịch biến (đồ thị đi xuống).",
          'Luôn tìm tập xác định D trước khi lập bảng biến thiên.',
        ],
        flashcards: [
          {
            id: 'fc_1',
            term: 'Hàm số đồng biến',
            definition: "Khi x tăng thì f(x) tăng (f'(x) > 0)",
            example: "y = 2x + 1 có y' = 2 > 0 nên đồng biến trên R",
            difficulty: 'easy',
          },
          {
            id: 'fc_2',
            term: 'Hàm số nghịch biến',
            definition: "Khi x tăng thì f(x) giảm (f'(x) < 0)",
            example: "y = -3x + 5 có y' = -3 < 0 nên nghịch biến trên R",
            difficulty: 'easy',
          },
          {
            id: 'fc_3',
            term: 'Điểm tới hạn',
            definition: "Điểm mà f'(x) = 0 hoặc f'(x) không xác định",
            example: "y = x^3 - 3x có nghiệm đạo hàm x = ±1",
            difficulty: 'medium',
          },
        ],
        practiceQuestions: [
          {
            id: 'q1',
            question: 'Cho hàm số y = x^3 - 3x^2 + 2. Mệnh đề nào sau đây ĐÚNG?',
            options: [
              'Đồng biến trên (0; 2)',
              'Nghịch biến trên (0; 2)',
              'Đồng biến trên (-∞; 2)',
              'Nghịch biến trên (2; +∞)',
            ],
            correctIndex: 1,
            explanation: "y' = 3x^2 - 6x = 3x(x - 2). Trong khoảng (0; 2), y' < 0 nên hàm số nghịch biến.",
          },
          {
            id: 'q2',
            question: 'Tìm khoảng đồng biến của hàm số y = -x^3 + 3x.',
            options: ['(-1; 1)', '(-∞; -1) và (1; +∞)', '(-∞; -1)', '(1; +∞)'],
            correctIndex: 0,
            explanation: "y' = -3x^2 + 3 > 0 <=> x ∈ (-1; 1).",
          },
          {
            id: 'q3',
            question: 'Hàm số nào đồng biến trên toàn bộ tập số thực R?',
            options: ['y = x^4 + 2x^2 + 1', 'y = x^3 + 2x - 5', 'y = (x+1)/(x-2)', 'y = tan(x)'],
            correctIndex: 1,
            explanation: "y' = 3x^2 + 2 > 0 với mọi x ∈ R.",
          },
        ],
      },
      {
        lessonId: 'toan-12-bai-2',
        courseSlug: 'toan-12-giai-tich',
        chapterId: 'c1',
        title: 'Bài 2: Cực trị của hàm số',
        order: 2,
        theoryContent: `## 1. Khái niệm cực đại, cực tiểu
- Nếu tồn tại khoảng $(a; b)$ chứa $x_0$ sao cho $f(x) < f(x_0)$ với mọi $x \\in (a; b) \\setminus \\{x_0\\}$ thì $x_0$ là **điểm cực đại**.
- Ngược lại $f(x) > f(x_0)$ thì $x_0$ là **điểm cực tiểu**.

## 2. Hai quy tắc tìm cực trị
- **Quy tắc 1 (Bảng biến thiên):** Qua $x_0$, $f'(x)$ đổi dấu từ $(+)$ sang $(-)$ $\\Rightarrow$ Cực đại; từ $(-)$ sang $(+)$ $\\Rightarrow$ Cực tiểu.
- **Quy tắc 2 (Đạo hàm cấp 2):** Nếu $f'(x_0) = 0$ và $f''(x_0) < 0$ $\\Rightarrow$ Cực đại; $f''(x_0) > 0$ $\\Rightarrow$ Cực tiểu.`,
        summary: [
          "Cực trị xảy ra tại điểm f'(x) đổi dấu (nghiệm bội lẻ).",
          "Phân biệt: 'Điểm cực trị của hàm số' (x0) vs 'Giá trị cực trị' (y0) vs 'Điểm cực trị của đồ thị' (x0; y0).",
        ],
        flashcards: [
          {
            id: 'fc_ct1',
            term: 'Điều kiện cần có cực trị',
            definition: "Nếu hàm có đạo hàm tại x0 và đạt cực trị tại x0 thì f'(x0) = 0",
            example: "f(x) = x^2 đạt cực tiểu tại x = 0 và f'(0) = 0",
            difficulty: 'easy',
          },
          {
            id: 'fc_ct2',
            term: 'Quy tắc đạo hàm cấp 2',
            definition: "f'(x0)=0 và f''(x0) < 0 là Cực đại; f''(x0) > 0 là Cực tiểu",
            example: "y = -x^2 có y'' = -2 < 0 nên x = 0 là điểm cực đại",
            difficulty: 'medium',
          },
        ],
        practiceQuestions: [
          {
            id: 'ct_q1',
            question: 'Hàm số y = x^3 - 3x + 2 có bao nhiêu điểm cực trị?',
            options: ['0', '1', '2', '3'],
            correctIndex: 2,
            explanation: "y' = 3x^2 - 3 = 0 có 2 nghiệm phân biệt x = ±1 nên hàm số có 2 điểm cực trị.",
          },
          {
            id: 'ct_q2',
            question: 'Giá trị cực tiểu của hàm số y = x^4 - 2x^2 + 3 là:',
            options: ['2', '3', '1', '-1'],
            correctIndex: 0,
            explanation: "y' = 4x^3 - 4x = 0 <=> x = 0 (CĐ, y=3) hoặc x = ±1 (CT, y=2). Vậy giá trị cực tiểu là 2.",
          },
        ],
      },
      {
        lessonId: 'ta-10-unit-1',
        courseSlug: 'tieng-anh-10-global-success',
        chapterId: 'unit-1',
        title: 'Lesson 1: Vocabulary & Household Chores',
        order: 1,
        theoryContent: `## 1. Key Vocabulary: Household Chores
- **do the heavy lifting**: làm việc nặng
- **do the laundry**: giặt quần áo
- **do the washing-up**: rửa bát đĩa
- **put out the rubbish**: đổ rác
- **shop for groceries**: mua thực phẩm

## 2. Grammar: Present Simple vs Present Continuous
- **Present Simple:** Diễn tả thói quen, lịch trình hằng ngày (*usually, often, every day*).
- **Present Continuous:** Diễn tả hành động đang diễn ra tại thời điểm nói (*now, at the moment, Look!*).`,
        summary: [
          'Nhớ cụm cố định: do the laundry, do the washing-up, put out the rubbish.',
          'Present Simple dùng cho thói quen; Present Continuous dùng cho hành động đang xảy ra.',
        ],
        flashcards: [
          {
            id: 'ta_fc1',
            term: 'Breadwinner (n)',
            definition: 'Người trụ cột kiếm tiền nuôi gia đình',
            example: 'Both parents work together to be the breadwinners.',
            difficulty: 'easy',
          },
          {
            id: 'ta_fc2',
            term: 'Homemaker (n)',
            definition: 'Người nội trợ chăm sóc gia đình',
            example: 'A homemaker manages the house and takes care of children.',
            difficulty: 'easy',
          },
        ],
        practiceQuestions: [
          {
            id: 'ta_q1',
            question: 'My sister usually ________ the washing-up after dinner.',
            options: ['does', 'is doing', 'do', 'did'],
            correctIndex: 0,
            explanation: 'Có trạng từ "usually" chỉ thói quen ở hiện tại đơn, chủ ngữ số ít dùng "does".',
          },
          {
            id: 'ta_q2',
            question: 'Listen! Someone ________ at the door.',
            options: ['knocks', 'is knocking', 'knocked', 'has knocked'],
            correctIndex: 1,
            explanation: 'Từ cảm thán "Listen!" báo hiệu hành động đang xảy ra -> Hiện tại tiếp diễn.',
          },
        ],
      },
      {
        lessonId: 'vl-9-bai-1',
        courseSlug: 'vat-ly-9-dien-hoc',
        chapterId: 'vl9-c1',
        title: 'Bài 1: Sự phụ thuộc của cường độ dòng điện vào hiệu điện thế',
        order: 1,
        theoryContent: `## 1. Kết luận thí nghiệm
Cường độ dòng điện chạy qua một dây dẫn **tỉ lệ thuận** với hiệu điện thế đặt vào hai đầu dây dẫn đó:
$$\\frac{U_1}{U_2} = \\frac{I_1}{I_2}$$

## 2. Đồ thị biểu diễn
Đồ thị biểu diễn sự phụ thuộc của cường độ dòng điện $I$ vào hiệu điện thế $U$ là một **đường thẳng đi qua gốc tọa độ** $(0; 0)$.`,
        summary: [
          'Khi hiệu điện thế tăng (hoặc giảm) bao nhiêu lần thì cường độ dòng điện tăng (hoặc giảm) bấy nhiêu lần.',
          'Đồ thị I theo U là đường thẳng đi qua gốc tọa độ.',
        ],
        flashcards: [
          {
            id: 'vl_fc1',
            term: 'Cường độ dòng điện (I)',
            definition: 'Đo độ mạnh yếu của dòng điện, đơn vị Ampe (A)',
            example: 'Đo bằng Ampe kế mắc nối tiếp trong mạch.',
            difficulty: 'easy',
          },
          {
            id: 'vl_fc2',
            term: 'Hiệu điện thế (U)',
            definition: 'Tạo ra dòng điện trong mạch, đơn vị Vôn (V)',
            example: 'Đo bằng Vôn kế mắc song song với đoạn mạch.',
            difficulty: 'easy',
          },
        ],
        practiceQuestions: [
          {
            id: 'vl_q1',
            question: 'Khi đặt hiệu điện thế 6V vào hai đầu dây dẫn thì dòng điện qua dây có cường độ 0.3A. Nếu tăng hiệu điện thế lên 12V thì cường độ dòng điện là:',
            options: ['0.15 A', '0.6 A', '0.9 A', '1.2 A'],
            correctIndex: 1,
            explanation: 'U tăng gấp 2 lần (6V -> 12V) nên I tăng gấp 2 lần: 0.3 × 2 = 0.6 A.',
          },
        ],
      },
      {
        lessonId: 'toan-6-bai-1',
        courseSlug: 'toan-6-so-hoc',
        chapterId: 't6-c1',
        title: 'Bài 1: Tập hợp và các phần tử của tập hợp',
        order: 1,
        theoryContent: `## 1. Cách viết một tập hợp
- Tên tập hợp đặt bằng chữ cái in hoa: $A, B, C...$
- Các phần tử nằm trong dấu ngoặc nhọn $\\{ ... \\}$, ngăn cách bởi dấu phẩy hoặc chấm phẩy.
- Ký hiệu $\\in$ đọc là "thuộc", $\\notin$ đọc là "không thuộc".

## 2. Hai cách mô tả tập hợp
1. **Liệt kê các phần tử:** $A = \\{0; 1; 2; 3; 4\\}$
2. **Chỉ ra tính chất đặc trưng:** $A = \\{x \\in \\mathbb{N} \\mid x < 5\\}$`,
        summary: [
          'Mỗi phần tử chỉ liệt kê một lần trong tập hợp.',
          'Thứ tự liệt kê các phần tử không làm thay đổi tập hợp.',
        ],
        flashcards: [
          {
            id: 't6_fc1',
            term: 'Ký hiệu ∈ và ∉',
            definition: '∈ là phần tử thuộc tập hợp; ∉ là không thuộc tập hợp',
            example: 'Với A = {1; 2; 3} thì 2 ∈ A và 5 ∉ A',
            difficulty: 'easy',
          },
        ],
        practiceQuestions: [
          {
            id: 't6_q1',
            question: 'Cho tập hợp M = {a; b; c; d}. Khẳng định nào sau đây ĐÚNG?',
            options: ['a ∉ M', 'e ∈ M', 'b ∈ M', '{a} ∈ M'],
            correctIndex: 2,
            explanation: 'Phần tử b nằm trong tập hợp M nên b ∈ M.',
          },
        ],
      },
      {
        lessonId: 'hh-11-bai-1',
        courseSlug: 'hoa-hoc-11-can-bang',
        chapterId: 'hh11-c1',
        title: 'Bài 1: Khái niệm về cân bằng hóa học',
        order: 1,
        theoryContent: `## 1. Phản ứng một chiều và phản ứng thuận nghịch
- Phản ứng thuận nghịch xảy ra đồng thời theo hai chiều ngược nhau trong cùng điều kiện (ký hiệu $\\rightleftharpoons$).
- Tại trạng thái **cân bằng hóa học**: tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch ($v_t = v_n$), nồng độ các chất không đổi.

## 2. Nguyên lý chuyển dịch cân bằng Le Chatelier
Khi tác động vào hệ cân bằng (nhiệt độ, áp suất, nồng độ), cân bằng chuyển dịch theo chiều **làm giảm tác động đó**.`,
        summary: [
          'Cân bằng hóa học là cân bằng động (vt = vn ≠ 0).',
          'Chất xúc tác làm tăng cả vt và vn như nhau nên KHÔNG làm chuyển dịch cân bằng.',
        ],
        flashcards: [
          {
            id: 'hh_fc1',
            term: 'Hằng số cân bằng Kc',
            definition: 'Chỉ phụ thuộc vào nhiệt độ và bản chất phản ứng',
            example: 'Không phụ thuộc vào nồng độ ban đầu hay chất xúc tác.',
            difficulty: 'medium',
          },
        ],
        practiceQuestions: [
          {
            id: 'hh_q1',
            question: 'Yếu tố nào sau đây KHÔNG làm chuyển dịch cân bằng hóa học?',
            options: ['Nhiệt độ', 'Áp suất', 'Nồng độ', 'Chất xúc tác'],
            correctIndex: 3,
            explanation: 'Chất xúc tác chỉ giúp hệ nhanh đạt tới trạng thái cân bằng chứ không làm chuyển dịch cân bằng.',
          },
        ],
      },
    ];

    for (const l of lessonsData) {
      await lessonModel.findOneAndUpdate(
        { lessonId: l.lessonId },
        { $set: l },
        { upsert: true },
      );
    }

    // Seed UserProgress for student1
    await progressModel.findOneAndUpdate(
      { userId: student1.id, lessonId: 'toan-12-bai-1' },
      {
        $set: {
          userId: student1.id,
          lessonId: 'toan-12-bai-1',
          courseSlug: 'toan-12-giai-tich',
          completedTheory: true,
          learnedFlashcardIds: ['fc_1', 'fc_2', 'fc_3'],
          practiceScore: 7,
          wrongQuestionIds: ['q3'],
        },
      },
      { upsert: true },
    );

    await progressModel.findOneAndUpdate(
      { userId: student1.id, lessonId: 'ta-10-unit-1' },
      {
        $set: {
          userId: student1.id,
          lessonId: 'ta-10-unit-1',
          courseSlug: 'tieng-anh-10-global-success',
          completedTheory: true,
          learnedFlashcardIds: ['ta_fc1', 'ta_fc2'],
          practiceScore: 10,
          wrongQuestionIds: [],
        },
      },
      { upsert: true },
    );

    console.log('✅ Đã seed Khóa học, Bài học & Tiến độ học tập (MongoDB).');

    // =========================================================================
    // 4. SEED EXAMS & EXAM ATTEMPTS (MongoDB)
    // =========================================================================
    await examModel.findOneAndUpdate(
      { examId: 'de-hoa-11-can-bang' },
      {
        $set: {
          examId: 'de-hoa-11-can-bang',
          title: 'Đề Kiểm Tra 15 Phút Hóa Học 11 - Cân Bằng Hóa Học',
          subject: 'Hóa học',
          grade: 11,
          durationMinutes: 15,
          totalQuestions: 3,
          description: 'Kiểm tra hằng số cân bằng Kc, phản ứng thuận nghịch và nguyên lý Le Chatelier.',
          questions: [
            {
              id: 'hh_e1',
              question: 'Tại trạng thái cân bằng hóa học, khẳng định nào sau đây ĐÚNG?',
              options: [
                'Tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch',
                'Phản ứng thuận và nghịch đều dừng lại',
                'Nồng độ chất sản phẩm luôn bằng chất tham gia',
                'Hằng số Kc luôn bằng 1',
              ],
              correctIndex: 0,
              explanation: 'Cân bằng hóa học là cân bằng động khi vt = vn ≠ 0.',
              difficulty: 'easy',
            },
            {
              id: 'hh_e2',
              question: 'Yếu tố nào làm thay đổi giá trị hằng số cân bằng Kc?',
              options: ['Nhiệt độ', 'Áp suất', 'Chất xúc tác', 'Nồng độ'],
              correctIndex: 0,
              explanation: 'Kc của một phản ứng thuận nghịch chỉ phụ thuộc vào nhiệt độ.',
              difficulty: 'medium',
            },
            {
              id: 'hh_e3',
              question: 'Cho cân bằng: N2(g) + 3H2(g) ⇌ 2NH3(g) (ΔH < 0). Khi tăng áp suất, cân bằng chuyển dịch theo chiều nào?',
              options: ['Chiều thuận', 'Chiều nghịch', 'Không chuyển dịch', 'Dừng lại'],
              correctIndex: 0,
              explanation: 'Tăng áp suất -> chuyển dịch theo chiều giảm số mol khí (từ 4 mol khí sang 2 mol khí: chiều thuận).',
              difficulty: 'medium',
            },
          ],
        },
      },
      { upsert: true },
    );

    const existingAttempts = await attemptModel.countDocuments({ userId: student1.id });
    if (existingAttempts === 0) {
      await attemptModel.insertMany([
        {
          userId: student1.id,
          examId: 'de-toan-12-thpt-2026',
          examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2026 - Môn Toán (Mã đề 101)',
          score: 8.33,
          totalQuestions: 6,
          correctCount: 5,
          wrongCount: 1,
          unansweredCount: 0,
          durationSeconds: 1240,
          answers: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 1, q6: 0 },
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          userId: student1.id,
          examId: 'de-ta-10-unit1-2',
          examTitle: 'Đề Kiểm Tra Tiếng Anh 10 - Unit 1: Family Life & Household Chores',
          score: 10,
          totalQuestions: 4,
          correctCount: 4,
          wrongCount: 0,
          unansweredCount: 0,
          durationSeconds: 540,
          answers: { ta_1: 0, ta_2: 0, ta_3: 0, ta_4: 0 },
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ]);
    }

    console.log('✅ Đã seed Đề thi & Lịch sử làm bài (MongoDB).');

    // =========================================================================
    // 5. SEED ANNOUNCEMENTS & CHAT MESSAGES (MongoDB)
    // =========================================================================
    const existingAnnCount = await announcementModel.countDocuments({
      classId: classToan12.id,
    });
    if (existingAnnCount === 0) {
      await announcementModel.insertMany([
        {
          classId: classToan12.id,
          title: '📌 Lịch ôn tập chuyên đề Khảo sát hàm số tuần này',
          content:
            'Các em chú ý hoàn thành Bài tập Tuần 1 và ôn lại phần Lý thuyết Bài 1 trước thứ Sáu. Bạn nào gặp khó khăn có thể hỏi trực tiếp trong phòng chat lớp hoặc dùng Gia sư AI Unilearn nhé!',
          authorId: teacher1.id,
          authorName: teacher1.fullName,
          isPinned: true,
        },
        {
          classId: classVatLy9.id,
          title: '⚡ Nhắc nhở nộp bài thực hành Định luật Ôm',
          content:
            'Thầy đã mở bài tập thực hành mới. Các em tính cẩn thận đơn vị Ampe và Ôm trước khi gửi bài nhé.',
          authorId: teacher1.id,
          authorName: teacher1.fullName,
          isPinned: true,
        },
      ]);
    }

    const existingChatCount = await chatModel.countDocuments({
      classId: classToan12.id,
    });
    if (existingChatCount === 0) {
      await chatModel.insertMany([
        {
          classId: classToan12.id,
          senderId: teacher1.id,
          senderName: teacher1.fullName,
          senderRole: UserRole.GIAO_VIEN,
          message: 'Chào cả lớp 12A1! Hôm nay chúng ta bắt đầu chuyên đề 1 nhé. Các em đã đọc phần lý thuyết chưa?',
        },
        {
          classId: classToan12.id,
          senderId: student1.id,
          senderName: student1.fullName,
          senderRole: UserRole.HOC_SINH,
          message: 'Dạ em chào thầy! Em đã xem xong lý thuyết và đang làm bài tập tuần 1 rồi ạ.',
        },
        {
          classId: classToan12.id,
          senderId: student2.id,
          senderName: student2.fullName,
          senderRole: UserRole.HOC_SINH,
          message: 'Thầy ơi câu 3 phần hàm bậc 4 có cần xét hệ số a riêng không ạ?',
        },
      ]);
    }

    console.log('✅ Đã seed Thông báo lớp & Tin nhắn mẫu (MongoDB).');
    console.log('\n🎉 HOÀN TẤT SEED DỮ LIỆU UNILEARN!');
    console.log('-----------------------------------------');
    console.log('Tài khoản thử nghiệm (Mật khẩu chung: 123456):');
    console.log('  • Giáo viên:  giaovien@unilearn.edu.vn');
    console.log('  • Học sinh:   hocsinh@unilearn.edu.vn (Mã HS: HS2026)');
    console.log('  • Phụ huynh:  phuhuynh@unilearn.edu.vn (Đã liên kết sẵn với HS2026)');
    console.log('-----------------------------------------\n');
  } finally {
    await app.close();
  }
}

bootstrapSeed().catch((err) => {
  console.error('❌ Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});

