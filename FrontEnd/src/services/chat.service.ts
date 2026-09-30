import { api } from './api';
import { ChatMessage, Announcement } from '../types/chat';

export const chatService = {
  /**
   * Lấy lịch sử tin nhắn trong phòng chat
   */
  async getMessageHistory(classId: number, limit = 50): Promise<ChatMessage[]> {
    const res = await api.get<ChatMessage[]>(`/chat/classes/${classId}/messages?limit=${limit}`);
    return res.data;
  },

  /**
   * Lấy danh sách thông báo chính thức của lớp
   */
  async getAnnouncements(classId: number): Promise<Announcement[]> {
    const res = await api.get<Announcement[]>(`/chat/classes/${classId}/announcements`);
    return res.data;
  },

  /**
   * Giáo viên đăng thông báo lớp mới
   */
  async createAnnouncement(
    classId: number,
    payload: { title: string; content: string; isPinned?: boolean },
  ): Promise<Announcement> {
    const res = await api.post<Announcement>(`/chat/classes/${classId}/announcements`, payload);
    return res.data;
  },
};
