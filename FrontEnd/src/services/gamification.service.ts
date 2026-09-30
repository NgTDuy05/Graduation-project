import { api } from './api';
import { UserStats } from '../types/auth';

export interface LeaderboardItem {
  rank: number;
  userId: number;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  studentCode?: string | null;
  streakDays: number;
  lightningPoints: number;
  rankTier: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  current: number;
  target: number;
  isCompleted: boolean;
}

export interface DailyQuestsResponse {
  date: string;
  totalPointsReward: number;
  quests: DailyQuest[];
}

export interface CheckInResponse {
  message: string;
  alreadyCheckedIn: boolean;
  streakChanged: boolean;
  pointsAdded: number;
  stats: UserStats;
}

export const gamificationService = {
  /**
   * Lấy Bảng xếp hạng học sinh
   */
  async getLeaderboard(limit = 10): Promise<LeaderboardItem[]> {
    const response = await api.get<LeaderboardItem[]>(`/gamification/leaderboard?limit=${limit}`);
    return response.data;
  },

  /**
   * Lấy danh sách nhiệm vụ hàng ngày
   */
  async getDailyQuests(): Promise<DailyQuestsResponse> {
    const response = await api.get<DailyQuestsResponse>('/gamification/daily-quests');
    return response.data;
  },

  /**
   * Điểm danh hàng ngày
   */
  async checkInToday(): Promise<CheckInResponse> {
    const response = await api.post<CheckInResponse>('/gamification/check-in');
    return response.data;
  },
};
