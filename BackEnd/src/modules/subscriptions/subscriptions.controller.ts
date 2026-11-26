import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Gói Tài Khoản & Đăng Ký (Subscriptions)')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Lấy danh sách các gói tài khoản (FREE / PRO)' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xem gói đăng ký hiện tại và lịch sử của người dùng' })
  getMySubscription(@CurrentUser('id') userId: number) {
    return this.subscriptionsService.getMySubscription(userId);
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Nâng cấp gói tài khoản lên Unilearn PRO' })
  upgradeSubscription(
    @CurrentUser('id') userId: number,
    @Body() dto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionsService.upgradeSubscription(userId, dto);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hủy gói PRO và chuyển về gói FREE' })
  cancelProSubscription(@CurrentUser('id') userId: number) {
    return this.subscriptionsService.cancelProSubscription(userId);
  }
}

