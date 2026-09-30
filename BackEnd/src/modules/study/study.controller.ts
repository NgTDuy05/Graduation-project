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
import { StudyService } from './study.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { AskTutorDto } from './dto/ask-tutor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Học Bài & Bài Giảng (Study Module)')
@Controller('study')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('courses')
  @ApiOperation({
    summary: 'Lấy danh sách các khoá học / môn học',
    description: 'Hỗ trợ lọc theo khối lớp (6-12) và môn học (Toán, Vật lý, v.v.)',
  })
  @ApiQuery({ name: 'grade', required: false, example: 12 })
  @ApiQuery({ name: 'subject', required: false, example: 'Toán' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getCourses(
    @Query('grade') grade?: number,
    @Query('subject') subject?: string,
  ) {
    return this.studyService.getCourses(grade, subject);
  }

  @Get('courses/:slug')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một khoá học và mục lục các chương/bài học',
  })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết khoá học thành công' })
  async getCourseBySlug(
    @Param('slug') slug: string,
    @Query('userId') userId?: number,
  ) {
    return this.studyService.getCourseBySlug(slug, userId);
  }

  @Get('lessons/:id')
  @ApiOperation({
    summary: 'Lấy nội dung chi tiết bài học (Lý thuyết, Flashcards, Trắc nghiệm củng cố)',
  })
  @ApiResponse({ status: 200, description: 'Lấy bài học thành công' })
  async getLessonById(
    @Param('id') lessonId: string,
    @Query('userId') userId?: number,
  ) {
    return this.studyService.getLessonById(lessonId, userId);
  }

  @Post('lessons/:id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Lưu tiến độ học tập của học sinh cho bài học này',
    description: 'Cập nhật hoàn thành lý thuyết, flashcards đã thuộc, điểm trắc nghiệm và câu sai.',
  })
  @ApiResponse({ status: 200, description: 'Lưu tiến độ thành công' })
  async saveProgress(
    @Param('id') lessonId: string,
    @CurrentUser('id') userId: number,
    @Body() dto: SaveProgressDto,
  ) {
    return this.studyService.saveProgress(userId, lessonId, dto);
  }

  @Post('ai-tutor')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Hỏi đáp Gia sư AI Unilearn về bài học',
    description: 'Nhận câu trả lời và gợi ý học tập chuẩn phương pháp sư phạm.',
  })
  @ApiResponse({ status: 200, description: 'Trả lời thành công' })
  async askTutor(@Body() dto: AskTutorDto) {
    return this.studyService.askTutor(dto);
  }
}
