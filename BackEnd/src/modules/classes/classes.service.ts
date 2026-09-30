import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { ClassMember } from './entities/class-member.entity';
import { Assignment } from './entities/assignment.entity';
import { AssignmentExtension } from './entities/assignment-extension.entity';
import {
  AssignmentSubmission,
  SubmissionStatus,
} from './entities/assignment-submission.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import {
  CreateAssignmentDto,
  ExtendDeadlineDto,
  SubmitAssignmentDto,
  GradeSubmissionDto,
} from './dto/assignment.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassMember)
    private readonly memberRepository: Repository<ClassMember>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentExtension)
    private readonly extensionRepository: Repository<AssignmentExtension>,
    @InjectRepository(AssignmentSubmission)
    private readonly submissionRepository: Repository<AssignmentSubmission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Sinh mã lớp học ngẫu nhiên 8 ký tự duy nhất
   */
  async generateUniqueClassCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let isUnique = false;
    let code = '';

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      const existing = await this.classRepository.findOne({
        where: { classCode: code },
      });
      if (!existing) isUnique = true;
    }
    return code;
  }

  /**
   * Giáo viên tạo lớp học mới
   */
  async createClass(teacherId: number, dto: CreateClassDto) {
    const classCode = await this.generateUniqueClassCode();

    const newClass = this.classRepository.create({
      ...dto,
      classCode,
      teacherId,
    });

    const savedClass = await this.classRepository.save(newClass);

    // Tự động add giáo viên làm thành viên TEACHER
    await this.memberRepository.save(
      this.memberRepository.create({
        classId: savedClass.id,
        userId: teacherId,
        roleInClass: 'TEACHER',
        status: 'APPROVED',
      }),
    );

    return savedClass;
  }

  /**
   * Lấy danh sách lớp do giáo viên phụ trách
   */
  async getTeacherClasses(teacherId: number) {
    return this.classRepository
      .createQueryBuilder('cls')
      .leftJoinAndSelect('cls.members', 'member', 'member.roleInClass = :role', {
        role: 'STUDENT',
      })
      .leftJoinAndSelect('cls.assignments', 'assignment')
      .where('cls.teacherId = :teacherId', { teacherId })
      .orderBy('cls.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Lấy danh sách lớp học sinh đã tham gia
   */
  async getStudentClasses(studentId: number) {
    const memberships = await this.memberRepository.find({
      where: { userId: studentId, roleInClass: 'STUDENT', status: 'APPROVED' },
      relations: ['class', 'class.teacher', 'class.assignments'],
      order: { joinedAt: 'DESC' },
    });

    return memberships.map((m) => m.class);
  }

  /**
   * Xem chi tiết 1 lớp học
   */
  async getClassById(classId: number, currentUserId?: number) {
    const cls = await this.classRepository.findOne({
      where: { id: classId },
      relations: [
        'teacher',
        'members',
        'members.user',
        'assignments',
        'assignments.extensions',
      ],
    });

    if (!cls) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    // Nếu là học sinh, gắn thêm thông tin bài nộp của học sinh đó
    let studentSubmissions: AssignmentSubmission[] = [];
    if (currentUserId) {
      studentSubmissions = await this.submissionRepository
        .createQueryBuilder('sub')
        .innerJoin('sub.assignment', 'asg')
        .where('asg.classId = :classId AND sub.studentId = :studentId', {
          classId,
          studentId: currentUserId,
        })
        .getMany();
    }

    return {
      class: cls,
      studentSubmissions,
    };
  }

  /**
   * Học sinh tham gia lớp bằng mã lớp 8 ký tự
   */
  async joinClassByCode(studentId: number, classCode: string) {
    const cls = await this.classRepository.findOne({
      where: { classCode: classCode.trim().toUpperCase() },
    });

    if (!cls) {
      throw new NotFoundException('Mã lớp học không tồn tại. Vui lòng kiểm tra lại!');
    }

    const existingMember = await this.memberRepository.findOne({
      where: { classId: cls.id, userId: studentId },
    });

    if (existingMember) {
      throw new ConflictException('Bạn đã tham gia lớp học này rồi');
    }

    const newMember = this.memberRepository.create({
      classId: cls.id,
      userId: studentId,
      roleInClass: 'STUDENT',
      status: 'APPROVED',
    });

    await this.memberRepository.save(newMember);

    // Tự động tạo bản ghi bài nộp chờ cho các bài tập hiện tại của lớp
    const assignments = await this.assignmentRepository.find({
      where: { classId: cls.id },
    });

    for (const asg of assignments) {
      await this.submissionRepository.save(
        this.submissionRepository.create({
          assignmentId: asg.id,
          studentId,
          status: SubmissionStatus.CHUA_LAM,
        }),
      );
    }

    return {
      message: `Tham gia lớp ${cls.name} thành công!`,
      class: cls,
    };
  }

  /**
   * Giáo viên thêm học sinh bằng Mã học sinh (studentCode 6 ký tự)
   */
  async addStudentByCode(teacherId: number, classId: number, studentCode: string) {
    const cls = await this.classRepository.findOne({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Lớp học không tồn tại');
    if (cls.teacherId !== teacherId) throw new ForbiddenException('Bạn không phải giáo viên phụ trách lớp này');

    const student = await this.userRepository.findOne({
      where: { studentCode: studentCode.trim().toUpperCase(), role: UserRole.HOC_SINH },
    });

    if (!student) {
      throw new NotFoundException(`Không tìm thấy học sinh với mã: ${studentCode.toUpperCase()}`);
    }

    const existingMember = await this.memberRepository.findOne({
      where: { classId, userId: student.id },
    });

    if (existingMember) {
      throw new ConflictException(`Học sinh "${student.fullName}" đã có trong lớp rồi`);
    }

    const newMember = this.memberRepository.create({
      classId,
      userId: student.id,
      roleInClass: 'STUDENT',
      status: 'APPROVED',
    });

    await this.memberRepository.save(newMember);

    // Tạo bản ghi bài nộp mặc định cho các bài tập hiện có
    const assignments = await this.assignmentRepository.find({ where: { classId } });
    for (const asg of assignments) {
      await this.submissionRepository.save(
        this.submissionRepository.create({
          assignmentId: asg.id,
          studentId: student.id,
          status: SubmissionStatus.CHUA_LAM,
        }),
      );
    }

    return {
      message: `Đã thêm học sinh ${student.fullName} (Mã: ${student.studentCode}) vào lớp!`,
      student,
    };
  }

  /**
   * Giáo viên xoá học sinh khỏi lớp
   */
  async removeStudent(teacherId: number, classId: number, memberId: number) {
    const cls = await this.classRepository.findOne({ where: { id: classId } });
    if (!cls || cls.teacherId !== teacherId) throw new ForbiddenException('Không có quyền thao tác');

    await this.memberRepository.delete({ id: memberId, classId });
    return { message: 'Đã xoá học sinh khỏi lớp học' };
  }

  /**
   * Giáo viên giao bài tập mới
   */
  async createAssignment(teacherId: number, classId: number, dto: CreateAssignmentDto) {
    const cls = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['members'],
    });

    if (!cls) throw new NotFoundException('Lớp học không tồn tại');
    if (cls.teacherId !== teacherId) throw new ForbiddenException('Chỉ giáo viên phụ trách mới được giao bài');

    const newAssignment = this.assignmentRepository.create({
      ...dto,
      deadline: new Date(dto.deadline),
      classId,
      createdBy: teacherId,
    });

    const savedAssignment = await this.assignmentRepository.save(newAssignment);

    // Khởi tạo trạng thái CHUA_LAM cho tất cả học sinh trong lớp
    const studentMembers = cls.members.filter((m) => m.roleInClass === 'STUDENT');
    for (const sm of studentMembers) {
      await this.submissionRepository.save(
        this.submissionRepository.create({
          assignmentId: savedAssignment.id,
          studentId: sm.userId,
          status: SubmissionStatus.CHUA_LAM,
        }),
      );
    }

    return savedAssignment;
  }

  /**
   * Giáo viên gia hạn bài tập (cho cả lớp hoặc riêng 1 học sinh)
   */
  async extendDeadline(teacherId: number, assignmentId: number, dto: ExtendDeadlineDto) {
    const asg = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['class'],
    });

    if (!asg) throw new NotFoundException('Không tìm thấy bài tập');
    if (asg.class.teacherId !== teacherId) throw new ForbiddenException('Chỉ giáo viên phụ trách mới được gia hạn');

    const extension = this.extensionRepository.create({
      assignmentId,
      studentId: dto.studentId || null,
      extendedDeadline: new Date(dto.extendedDeadline),
      reason: dto.reason,
    });

    await this.extensionRepository.save(extension);

    return {
      message: dto.studentId
        ? 'Đã gia hạn bài tập riêng cho học sinh thành công'
        : 'Đã gia hạn bài tập cho cả lớp thành công',
      extension,
    };
  }

  /**
   * Học sinh nộp bài tập
   */
  async submitAssignment(studentId: number, assignmentId: number, dto: SubmitAssignmentDto) {
    const asg = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['extensions'],
    });

    if (!asg) throw new NotFoundException('Không tìm thấy bài tập');

    // Kiểm tra hạn nộp thực tế (xét gia hạn riêng hoặc gia hạn lớp)
    let effectiveDeadline = new Date(asg.deadline);
    const individualExt = asg.extensions?.find((e) => e.studentId === studentId);
    const classExt = asg.extensions?.find((e) => e.studentId === null);

    if (individualExt) {
      effectiveDeadline = new Date(individualExt.extendedDeadline);
    } else if (classExt) {
      effectiveDeadline = new Date(classExt.extendedDeadline);
    }

    const now = new Date();
    const isLate = now > effectiveDeadline;

    if (isLate && !asg.allowLateSubmission) {
      throw new BadRequestException('Đã quá thời hạn nộp bài tập và bài tập không cho phép nộp muộn');
    }

    let submission = await this.submissionRepository.findOne({
      where: { assignmentId, studentId },
    });

    if (!submission) {
      submission = this.submissionRepository.create({
        assignmentId,
        studentId,
      });
    }

    submission.content = dto.content;
    submission.submittedAt = now;
    submission.status = isLate ? SubmissionStatus.QUA_HAN : SubmissionStatus.DA_NOP;

    await this.submissionRepository.save(submission);

    return {
      message: isLate ? 'Đã nộp bài (Trạng thái: Nộp muộn)' : 'Nộp bài tập thành công đúng hạn!',
      submission,
    };
  }

  /**
   * Giáo viên xem danh sách bài nộp và thống kê
   */
  async getAssignmentSubmissions(teacherId: number, assignmentId: number) {
    const asg = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['class'],
    });

    if (!asg) throw new NotFoundException('Bài tập không tồn tại');
    if (asg.class.teacherId !== teacherId) throw new ForbiddenException('Không có quyền xem bài nộp');

    const submissions = await this.submissionRepository.find({
      where: { assignmentId },
      relations: ['student'],
      order: { submittedAt: 'DESC' },
    });

    const stats = {
      total: submissions.length,
      submitted: submissions.filter((s) => s.status === SubmissionStatus.DA_NOP).length,
      late: submissions.filter((s) => s.status === SubmissionStatus.QUA_HAN).length,
      pending: submissions.filter((s) => s.status === SubmissionStatus.CHUA_LAM).length,
      graded: submissions.filter((s) => s.score !== null).length,
    };

    return {
      assignment: asg,
      stats,
      submissions,
    };
  }

  /**
   * Giáo viên chấm điểm và nhận xét bài nộp
   */
  async gradeSubmission(teacherId: number, submissionId: number, dto: GradeSubmissionDto) {
    const sub = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['assignment', 'assignment.class', 'student'],
    });

    if (!sub) throw new NotFoundException('Không tìm thấy bài nộp');
    if (sub.assignment.class.teacherId !== teacherId) {
      throw new ForbiddenException('Chỉ giáo viên phụ trách mới có quyền chấm điểm');
    }

    sub.score = dto.score;
    sub.feedback = dto.feedback || '';
    sub.gradedAt = new Date();

    await this.submissionRepository.save(sub);

    return {
      message: `Đã chấm điểm cho học sinh ${sub.student.fullName}: ${dto.score} điểm`,
      submission: sub,
    };
  }
}
