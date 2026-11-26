import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository, In } from 'typeorm';
import { Model } from 'mongoose';
import { ParentStudentLink } from './entities/parent-student-link.entity';
import { LinkStudentDto } from './dto/link-student.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { UserStats } from '../users/entities/user-stats.entity';
import { ClassMember } from '../classes/entities/class-member.entity';
import { Assignment } from '../classes/entities/assignment.entity';
import {
  AssignmentSubmission,
  SubmissionStatus,
} from '../classes/entities/assignment-submission.entity';
import {
  UserProgress,
  UserProgressDocument,
} from '../study/schemas/user-progress.schema';
import { Course, CourseDocument } from '../study/schemas/course.schema';
import {
  ExamAttempt,
  ExamAttemptDocument,
} from '../practice/schemas/exam-attempt.schema';
import {
  Announcement,
  AnnouncementDocument,
} from '../chat/schemas/announcement.schema';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(ParentStudentLink)
    private readonly linkRepository: Repository<ParentStudentLink>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserStats)
    private readonly statsRepository: Repository<UserStats>,
    @InjectRepository(ClassMember)
    private readonly classMemberRepository: Repository<ClassMember>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentSubmission)
    private readonly submissionRepository: Repository<AssignmentSubmission>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectModel(UserProgress.name)
    private readonly progressModel: Model<UserProgressDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(ExamAttempt.name)
    private readonly examAttemptModel: Model<ExamAttemptDocument>,
    @InjectModel(Announcement.name)
    private readonly announcementModel: Model<AnnouncementDocument>,
  ) {}

  /**
   * Lấy danh sách học sinh đã liên kết với phụ huynh
   */
  async getLinkedChildren(parentId: number) {
    const links = await this.linkRepository.find({
      where: { parentId },
      relations: ['student', 'student.stats'],
      order: { createdAt: 'ASC' },
    });

    return links.map((link) => ({
      linkId: link.id,
      relationship: link.relationship,
      linkedAt: link.createdAt,
      student: {
        id: link.student.id,
        fullName: link.student.fullName,
        username: link.student.username,
        email: link.student.email,
        studentCode: link.student.studentCode,
        avatarUrl: link.student.avatarUrl,
        stats: link.student.stats || {
          streakDays: 0,
          lightningPoints: 0,
          rankTier: 'Đồng',
          lastActiveDate: null,
        },
      },
    }));
  }

  /**
   * Liên kết phụ huynh với học sinh thông qua Mã học sinh 6 ký tự
   */
  async linkChildByCode(parentId: number, dto: LinkStudentDto) {
    const code = dto.studentCode.trim().toUpperCase();
    const student = await this.userRepository.findOne({
      where: { studentCode: code, role: UserRole.HOC_SINH },
      relations: ['stats'],
    });

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy học sinh với mã: ${code}. Vui lòng kiểm tra lại!`,
      );
    }

    const existing = await this.linkRepository.findOne({
      where: { parentId, studentId: student.id },
    });

    if (existing) {
      throw new ConflictException(
        `Bạn đã liên kết với học sinh "${student.fullName}" rồi`,
      );
    }

    const newLink = this.linkRepository.create({
      parentId,
      studentId: student.id,
      relationship: dto.relationship?.trim() || 'Phụ huynh',
    });

    await this.linkRepository.save(newLink);

    return {
      message: `Liên kết thành công với học sinh ${student.fullName} (Mã: ${student.studentCode})!`,
      linkId: newLink.id,
      student: {
        id: student.id,
        fullName: student.fullName,
        studentCode: student.studentCode,
      },
    };
  }

  /**
   * Hủy liên kết với học sinh
   */
  async unlinkChild(parentId: number, studentId: number) {
    const link = await this.linkRepository.findOne({
      where: { parentId, studentId },
    });

    if (!link) {
      throw new NotFoundException('Không tìm thấy liên kết với học sinh này');
    }

    await this.linkRepository.delete(link.id);
    return { message: 'Đã hủy liên kết theo dõi học sinh thành công' };
  }

  /**
   * Lấy báo cáo học tập toàn diện của 1 học sinh đã liên kết
   */
  async getChildOverview(parentId: number, studentId: number) {
    const link = await this.linkRepository.findOne({
      where: { parentId, studentId },
      relations: ['student', 'student.stats'],
    });

    if (!link) {
      throw new ForbiddenException(
        'Bạn chưa liên kết với học sinh này hoặc không có quyền xem dữ liệu',
      );
    }

    const student = link.student;
    const stats =
      student.stats ||
      (await this.statsRepository.findOne({ where: { userId: studentId } })) || {
        streakDays: 0,
        lightningPoints: 0,
        rankTier: 'Đồng',
        lastActiveDate: null,
      };

    const subscription = await this.subscriptionRepository.findOne({
      where: { userId: studentId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    // 1. Lớp học & Bài tập từ MySQL
    const memberships = await this.classMemberRepository.find({
      where: { userId: studentId, roleInClass: 'STUDENT', status: 'APPROVED' },
      relations: ['class', 'class.teacher'],
    });

    const classes = memberships.map((m) => m.class);
    const classIds = classes.map((c) => c.id);

    let assignmentsList: Array<{
      id: number;
      title: string;
      className: string;
      subject: string;
      deadline: Date;
      status: SubmissionStatus;
      score: number | null;
      feedback: string | null;
      submittedAt: Date | null;
      gradedAt: Date | null;
    }> = [];

    if (classIds.length > 0) {
      const assignments = await this.assignmentRepository.find({
        where: { classId: In(classIds) },
        relations: ['class'],
        order: { deadline: 'DESC' },
      });

      const submissions = await this.submissionRepository.find({
        where: { studentId },
      });
      const subMap = new Map(submissions.map((s) => [s.assignmentId, s]));

      assignmentsList = assignments.map((asg) => {
        const sub = subMap.get(asg.id);
        return {
          id: asg.id,
          title: asg.title,
          className: asg.class?.name || 'Lớp học',
          subject: asg.class?.subject || '',
          deadline: asg.deadline,
          status: sub?.status || SubmissionStatus.CHUA_LAM,
          score: sub?.score !== undefined && sub?.score !== null ? Number(sub.score) : null,
          feedback: sub?.feedback || null,
          submittedAt: sub?.submittedAt || null,
          gradedAt: sub?.gradedAt || null,
        };
      });
    }

    // 2. Tiến độ học bài từ MongoDB
    const [studyProgress, courses, examAttempts] = await Promise.all([
      this.progressModel.find({ userId: studentId }).sort({ updatedAt: -1 }).exec(),
      this.courseModel.find().exec(),
      this.examAttemptModel
        .find({ userId: studentId })
        .sort({ completedAt: -1 })
        .limit(20)
        .exec(),
    ]);

    const courseMap = new Map(courses.map((c) => [c.slug, c]));

    const studyDetails = studyProgress.map((p) => {
      const course = courseMap.get(p.courseSlug);
      return {
        lessonId: p.lessonId,
        courseSlug: p.courseSlug,
        courseTitle: course?.title || p.courseSlug,
        subject: course?.subject || 'Khác',
        completedTheory: p.completedTheory,
        learnedFlashcardsCount: p.learnedFlashcardIds?.length || 0,
        practiceScore: p.practiceScore || 0,
        wrongQuestionsCount: p.wrongQuestionIds?.length || 0,
      };
    });

    // 3. Thông báo từ giáo viên các lớp của con
    const announcements =
      classIds.length > 0
        ? await this.announcementModel
            .find({ classId: { $in: classIds } })
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(15)
            .exec()
        : [];

    const classNameMap = new Map(classes.map((c) => [c.id, c.name]));

    // 4. Tính toán các chỉ số KPI tổng hợp
    const submittedCount = assignmentsList.filter(
      (a) => a.status === SubmissionStatus.DA_NOP || a.status === SubmissionStatus.QUA_HAN,
    ).length;
    const overdueCount = assignmentsList.filter(
      (a) => a.status === SubmissionStatus.CHUA_LAM && new Date(a.deadline) < new Date(),
    ).length;

    const gradedScores = assignmentsList
      .filter((a) => a.score !== null)
      .map((a) => a.score as number);
    const examScores = examAttempts.map((e) => e.score);
    const allScores = [...gradedScores, ...examScores];
    const averageScore =
      allScores.length > 0
        ? Number((allScores.reduce((acc, s) => acc + s, 0) / allScores.length).toFixed(2))
        : null;

    const completedLessonsCount = studyProgress.filter((p) => p.completedTheory).length;
    const totalFlashcardsLearned = studyProgress.reduce(
      (sum, p) => sum + (p.learnedFlashcardIds?.length || 0),
      0,
    );

    return {
      relationship: link.relationship,
      student: {
        id: student.id,
        fullName: student.fullName,
        username: student.username,
        email: student.email,
        studentCode: student.studentCode,
        planType: subscription?.planType || 'FREE',
        stats,
      },
      summary: {
        totalClasses: classes.length,
        totalAssignments: assignmentsList.length,
        submittedAssignments: submittedCount,
        overdueAssignments: overdueCount,
        completedLessons: completedLessonsCount,
        totalFlashcardsLearned,
        totalExamsTaken: examAttempts.length,
        averageScore,
      },
      classes: classes.map((c) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
        subject: c.subject,
        classCode: c.classCode,
        teacherName: c.teacher?.fullName || 'Giáo viên',
      })),
      assignments: assignmentsList,
      studyProgress: studyDetails,
      examAttempts,
      announcements: announcements.map((ann) => ({
        _id: ann._id,
        classId: ann.classId,
        className: classNameMap.get(ann.classId) || `Lớp #${ann.classId}`,
        title: ann.title,
        content: ann.content,
        authorName: ann.authorName,
        isPinned: ann.isPinned,
        createdAt: (ann as unknown as { createdAt?: Date }).createdAt,
      })),
    };
  }
}

