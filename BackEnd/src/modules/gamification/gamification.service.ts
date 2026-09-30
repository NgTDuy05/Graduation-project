import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStats } from '../users/entities/user-stats.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(UserStats)
    private readonly userStatsRepository: Repository<UserStats>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Lấy Bảng xếp hạng Top học sinh có điểm tia sét cao nhất
   */
  async getLeaderboard(limit = 10) {
    const topStats = await this.userStatsRepository
      .createQueryBuilder('stats')
      .innerJoinAndSelect('stats.user', 'user')
      .where('user.role = :role', { role: 'HOC_SINH' })
      .orderBy('stats.lightningPoints', 'DESC')
      .addOrderBy('stats.streakDays', 'DESC')
      .take(limit)
      .getMany();

    return topStats.map((item, index) => ({
      rank: index + 1,
      userId: item.userId,
      fullName: item.user.fullName,
      username: item.user.username,
      avatarUrl: item.user.avatarUrl,
      studentCode: item.user.studentCode,
      streakDays: item.streakDays,
      lightningPoints: item.lightningPoints,
      rankTier: item.rankTier,
    }));
  }

  /**
   * Lấy danh sách nhiệm vụ hàng ngày của học sinh
   */
  async getDailyQuests(userId: number) {
    const stats = await this.userStatsRepository.findOne({
      where: { userId },
    });

    const isCheckedInToday = stats?.lastActiveDate
      ? new Date(stats.lastActiveDate).toDateString() === new Date().toDateString()
      : false;

    return {
      date: new Date().toISOString().split('T')[0],
      totalPointsReward: 60,
      quests: [
        {
          id: 'quest_checkin',
          title: 'Điểm danh chuyên cần hôm nay',
          description: 'Đăng nhập vào Unilearn để duy trì ngọn lửa học tập',
          rewardPoints: 10,
          current: isCheckedInToday ? 1 : 0,
          target: 1,
          isCompleted: isCheckedInToday,
        },
        {
          id: 'quest_study_lesson',
          title: 'Học 1 bài học mới',
          description: 'Đọc lý thuyết và nắm vững kiến thức cốt lõi',
          rewardPoints: 20,
          current: 0,
          target: 1,
          isCompleted: false,
        },
        {
          id: 'quest_flashcard',
          title: 'Luyện 10 thẻ ghi nhớ',
          description: 'Củng cố định nghĩa và công thức với Flashcards',
          rewardPoints: 15,
          current: 4,
          target: 10,
          isCompleted: false,
        },
        {
          id: 'quest_exam',
          title: 'Hoàn thành 1 bài trắc nghiệm',
          description: 'Kiểm tra mức độ hiểu bài và tích lũy XP',
          rewardPoints: 15,
          current: 0,
          target: 1,
          isCompleted: false,
        },
      ],
    };
  }

  /**
   * Điểm danh hàng ngày tăng chuỗi Streak và cộng điểm sét
   */
  async checkInToday(userId: number) {
    let stats = await this.userStatsRepository.findOne({
      where: { userId },
    });

    if (!stats) {
      stats = this.userStatsRepository.create({
        userId,
        streakDays: 0,
        lightningPoints: 0,
        rankTier: 'Đồng',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streakChanged = false;
    let pointsAdded = 0;

    if (!stats.lastActiveDate) {
      stats.streakDays = 1;
      stats.lightningPoints += 15;
      stats.lastActiveDate = today;
      streakChanged = true;
      pointsAdded = 15;
    } else {
      const lastActive = new Date(stats.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastActive.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Đã điểm danh hôm nay rồi
        return {
          message: 'Bạn đã điểm danh học tập hôm nay rồi! Tiếp tục duy trì nhé!',
          alreadyCheckedIn: true,
          stats,
        };
      } else if (diffDays === 1) {
        // Học liên tiếp các ngày
        stats.streakDays += 1;
        stats.lightningPoints += 15;
        stats.lastActiveDate = today;
        streakChanged = true;
        pointsAdded = 15;
      } else {
        // Bị đứt chuỗi streak
        stats.streakDays = 1;
        stats.lightningPoints += 10;
        stats.lastActiveDate = today;
        streakChanged = true;
        pointsAdded = 10;
      }
    }

    // Cập nhật hạng học viên
    if (stats.lightningPoints >= 500) {
      stats.rankTier = 'Kim Cương';
    } else if (stats.lightningPoints >= 250) {
      stats.rankTier = 'Vàng';
    } else if (stats.lightningPoints >= 100) {
      stats.rankTier = 'Bạc';
    } else {
      stats.rankTier = 'Đồng';
    }

    await this.userStatsRepository.save(stats);

    return {
      message: `Điểm danh thành công! +${pointsAdded} Điểm tia sét ⚡`,
      alreadyCheckedIn: false,
      streakChanged,
      pointsAdded,
      stats,
    };
  }
}
