import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Gamification & Bảng Xếp Hạng')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Lấy Bảng xếp hạng Top học sinh',
    description: 'Danh sách học sinh có điểm tia sét và chuỗi ngày học cao nhất.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Lấy bảng xếp hạng thành công' })
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.gamificationService.getLeaderboard(limit ? Number(limit) : 10);
  }

  @Get('daily-quests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Lấy danh sách nhiệm vụ hàng ngày của học sinh',
    description: 'Trả về các nhiệm vụ cần thực hiện trong ngày, thanh tiến độ và điểm thưởng.',
  })
  @ApiResponse({ status: 200, description: 'Lấy nhiệm vụ thành công' })
  async getDailyQuests(@CurrentUser('id') userId: number) {
    return this.gamificationService.getDailyQuests(userId);
  }

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Điểm danh hàng ngày',
    description: 'Gia tăng chuỗi ngày học streak và cộng điểm tia sét tích lũy.',
  })
  @ApiResponse({ status: 200, description: 'Điểm danh thành công' })
  async checkInToday(@CurrentUser('id') userId: number) {
    return this.gamificationService.checkInToday(userId);
  }
}
