import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { JoinClassDto, AddStudentByCodeDto } from './dto/join-class.dto';
import {
  CreateAssignmentDto,
  ExtendDeadlineDto,
  SubmitAssignmentDto,
  GradeSubmissionDto,
} from './dto/assignment.dto';

@ApiTags('Lớp Học & Bài Tập (Classes Module)')
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(UserRole.GIAO_VIEN)
  @ApiOperation({
    summary: 'Giáo viên tạo lớp học mới',
    description: 'Tạo lớp và tự sinh mã lớp 8 ký tự duy nhất.',
  })
  @ApiResponse({ status: 201, description: 'Tạo lớp học thành công' })
  async createClass(
    @CurrentUser('id') teacherId: number,
    @Body() dto: CreateClassDto,
  ) {
    return this.classesService.createClass(teacherId, dto);
  }

  @Get('teacher')
  @Roles(UserRole.GIAO_VIEN)
  @ApiOperation({ summary: 'Lấy danh sách lớp học do giáo viên phụ trách' })
  async getTeacherClasses(@CurrentUser('id') teacherId: number) {
    return this.classesService.getTeacherClasses(teacherId);
  }

  @Get('student')
  @Roles(UserRole.HOC_SINH)
  @ApiOperation({ summary: 'Lấy danh sách lớp học mà học sinh đã tham gia' })
  async getStudentClasses(@CurrentUser('id') studentId: number) {
    return this.classesService.getStudentClasses(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một lớp học, thành viên và bài tập' })
  async getClassById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.classesService.getClassById(id, userId);
  }

  @Post('join')
  @Roles(UserRole.HOC_SINH)
  @ApiOperation({
    summary: 'Học sinh tham gia lớp học bằng mã lớp 8 ký tự',
  })
  async joinClassByCode(
    @CurrentUser('id') studentId: number,
    @Body() dto: JoinClassDto,
  ) {
    return this.classesService.joinClassByCode(studentId, dto.classCode);
  }

  @Post(':id/students')
  @Roles(UserRole.GIAO_VIEN)
  @ApiOperation({
    summary: 'Giáo viên thêm học sinh vào lớp bằng Mã học sinh (6 ký tự)',
  })
  async addStudentByCode(
    @Param('id', ParseIntPipe) classId: number,
    @CurrentUser('id') teacherId: number,
    @Body() dto: AddStudentByCodeDto,
  ) {
    return this.classesService.addStudentByCode(teacherId, classId, dto.studentCode);
  }

  @Delete(':id/members/:memberId')
  @Roles(UserRole.GIAO_VIEN)
  @ApiOperation({ summary: 'Giáo viên xoá học sinh khỏi lớp học' })
  async removeStudent(
    @Param('id', ParseIntPipe) classId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @CurrentUser('id') teacherId: number,
  ) {
    return this.classesService.removeStudent(teacherId, classId, memberId);
  }

  @Post(':id/assignments')
  @Roles(UserRole.GIAO_VIEN)
  @ApiOperation({ summary: 'Giáo viên giao bài tập mới cho lớp' })
  async createAssignment(
    @Param('id', ParseIntPipe) classId: number,
    @CurrentUser('id') teacherId: number,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.classesService.createAssignment(teacherId, classId, dto);
  }

  @Post('assignments/:assignmentId/extensions')
  @Roles(UserRole.GIAO_VIEN)
  @ApiOperation({
    summary: 'Giáo viên gia hạn bài tập (cho cả lớp hoặc riêng 1 học sinh)',
  })
  async extendDeadline(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @CurrentUser('id') teacherId: number,
    @Body() dto: ExtendDeadlineDto,
  ) {
    return this.classesService.extendDeadline(teacherId, assignmentId, dto);
  }

  @Post('assignments/:assignmentId/submit')
  @Roles(UserRole.HOC_SINH)
  @ApiOperation({ summary: 'Học sinh nộp bài tập' })
  async submitAssignment(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @CurrentUser('id') studentId: number,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.classesService.submitAssignment(studentId, assignmentId, dto);
  }

  @Get('assignments/:assignmentId/submissions')
  @Roles(UserRole.GIAO_VIEN)
  @ApiOperation({
    summary: 'Giáo viên xem thống kê và danh sách bài nộp của học sinh',
  })
  async getAssignmentSubmissions(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @CurrentUser('id') teacherId: number,
  ) {
    return this.classesService.getAssignmentSubmissions(teacherId, assignmentId);
  }

  @Post('submissions/:submissionId/grade')
  @Roles(UserRole.GIAO_VIEN)
  @ApiOperation({ summary: 'Giáo viên chấm điểm và nhận xét bài nộp' })
  async gradeSubmission(
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @CurrentUser('id') teacherId: number,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.classesService.gradeSubmission(teacherId, submissionId, dto);
  }
}
