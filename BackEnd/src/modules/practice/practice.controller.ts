import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PracticeService } from './practice.service';
import { SubmitExamAttemptDto } from './dto/submit-exam.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Ôn Luyện & Thi Trắc Nghiệm (Practice Module)')
@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get('exams')
  @ApiOperation({ summary: 'Lấy danh sách đề thi theo khối lớp và môn học' })
  @ApiQuery({ name: 'grade', required: false, example: 12 })
  @ApiQuery({ name: 'subject', required: false, example: 'Toán' })
  async getExams(
    @Query('grade') grade?: number,
    @Query('subject') subject?: string,
  ) {
    return this.practiceService.getExams(grade, subject);
  }

  @Get('exams/:id')
  @ApiOperation({
    summary: 'Lấy nội dung đề thi để chuẩn bị làm bài (đã ẩn đáp án đúng)',
  })
  async getExamById(@Param('id') examId: string) {
    return this.practiceService.getExamById(examId, true);
  }

  @Post('exams/:id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Nộp bài thi, chấm điểm tự động và nhận phân tích chi tiết',
  })
  async submitExamAttempt(
    @Param('id') examId: string,
    @CurrentUser('id') userId: number,
    @Body() dto: SubmitExamAttemptDto,
  ) {
    return this.practiceService.submitExamAttempt(userId, examId, dto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy lịch sử các lần thi của học sinh' })
  async getAttemptsHistory(@CurrentUser('id') userId: number) {
    return this.practiceService.getAttemptsHistory(userId);
  }

  @Get('attempts/:attemptId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xem lại kết quả và phân tích chi tiết một bài thi đã nộp' })
  async getAttemptDetail(
    @Param('attemptId') attemptId: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.practiceService.getAttemptDetail(attemptId, userId);
  }
}
