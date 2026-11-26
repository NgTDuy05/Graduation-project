import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, PlanType } from './entities/subscription.entity';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  /**
   * Danh sách các gói tài khoản Unilearn
   */
  getPlans() {
    return [
      {
        planType: PlanType.FREE,
        name: 'Gói Miễn Phí (FREE)',
        priceMonthly: 0,
        priceYearly: 0,
        description: 'Phù hợp để làm quen với nền tảng học tập thông minh Unilearn.',
        features: [
          'Truy cập toàn bộ bài giảng lý thuyết Lớp 6 - 12',
          'Luyện tập Flashcards & Trắc nghiệm củng cố',
          'Tham gia lớp học trực tuyến & Chat realtime',
          'Hỏi đáp Gia sư AI Unilearn (10 lượt/ngày)',
        ],
      },
      {
        planType: PlanType.PRO,
        name: 'Gói Unilearn PRO',
        priceMonthly: 79000,
        priceYearly: 699000,
        description: 'Mở khóa toàn bộ sức mạnh AI, kho đề thi nâng cao và báo cáo chuyên sâu.',
        features: [
          'Không giới hạn hỏi đáp Gia sư AI Gemini 24/7',
          'Mở khóa toàn bộ đề thi thử THPT & Đánh giá năng lực',
          'Phân tích lỗ hổng kiến thức & Lộ trình cá nhân hóa',
          'Báo cáo tiến độ chi tiết gửi Phụ huynh theo thời gian thực',
          'Huy hiệu PRO nổi bật trên Bảng xếp hạng',
        ],
      },
    ];
  }

  /**
   * Lấy gói đăng ký hiện tại của người dùng (tự cấp FREE nếu chưa có)
   */
  async getMySubscription(userId: number) {
    let activeSub = await this.subscriptionRepository.findOne({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (!activeSub) {
      activeSub = this.subscriptionRepository.create({
        userId,
        planType: PlanType.FREE,
        startDate: new Date(),
        endDate: null,
        isActive: true,
      });
      await this.subscriptionRepository.save(activeSub);
    }

    // Kiểm tra hết hạn PRO nếu có endDate
    if (
      activeSub.planType === PlanType.PRO &&
      activeSub.endDate &&
      new Date(activeSub.endDate) < new Date()
    ) {
      activeSub.isActive = false;
      await this.subscriptionRepository.save(activeSub);

      activeSub = this.subscriptionRepository.create({
        userId,
        planType: PlanType.FREE,
        startDate: new Date(),
        endDate: null,
        isActive: true,
      });
      await this.subscriptionRepository.save(activeSub);
    }

    const history = await this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      current: activeSub,
      history,
    };
  }

  /**
   * Nâng cấp hoặc chuyển đổi gói tài khoản
   */
  async upgradeSubscription(userId: number, dto: UpgradeSubscriptionDto) {
    if (dto.planType === PlanType.FREE) {
      return this.cancelProSubscription(userId);
    }

    const months = dto.durationMonths || 1;
    if (months < 1 || months > 36) {
      throw new BadRequestException('Thời hạn gói phải từ 1 đến 36 tháng');
    }

    // Vô hiệu hoá các gói cũ đang active
    await this.subscriptionRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const newSub = this.subscriptionRepository.create({
      userId,
      planType: PlanType.PRO,
      startDate,
      endDate,
      isActive: true,
    });

    await this.subscriptionRepository.save(newSub);

    return {
      message: `Kích hoạt gói Unilearn PRO (${months} tháng) thành công! 🎉`,
      subscription: newSub,
    };
  }

  /**
   * Hủy gói PRO và trở về gói FREE
   */
  async cancelProSubscription(userId: number) {
    await this.subscriptionRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    const freeSub = this.subscriptionRepository.create({
      userId,
      planType: PlanType.FREE,
      startDate: new Date(),
      endDate: null,
      isActive: true,
    });

    await this.subscriptionRepository.save(freeSub);

    return {
      message: 'Đã chuyển tài khoản về gói Miễn phí (FREE).',
      subscription: freeSub,
    };
  }
}

