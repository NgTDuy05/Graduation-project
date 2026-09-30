import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateAnnouncementDto } from './dto/chat.dto';

@ApiTags('Chat Realtime & Thông Báo Lớp (Chat Module)')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('classes/:classId/messages')
  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn trong phòng chat của lớp' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async getMessageHistory(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessageHistory(classId, limit ? Number(limit) : 50);
  }

  @Get('classes/:classId/announcements')
  @ApiOperation({ summary: 'Lấy danh sách thông báo chính thức của lớp học' })
  async getAnnouncements(@Param('classId', ParseIntPipe) classId: number) {
    return this.chatService.getAnnouncements(classId);
  }

  @Post('classes/:classId/announcements')
  @Roles(UserRole.GIAO_VIEN)
  @ApiOperation({ summary: 'Giáo viên đăng thông báo mới cho lớp học' })
  async createAnnouncement(
    @Param('classId', ParseIntPipe) classId: number,
    @CurrentUser('id') authorId: number,
    @CurrentUser('fullName') authorName: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.chatService.createAnnouncement(
      classId,
      authorId,
      authorName,
      dto,
    );
  }
}
