import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { Announcement, AnnouncementDocument } from './schemas/announcement.schema';
import { CreateAnnouncementDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessageDocument>,
    @InjectModel(Announcement.name)
    private readonly announcementModel: Model<AnnouncementDocument>,
  ) {}

  /**
   * Lưu tin nhắn chat vào MongoDB
   */
  async saveMessage(
    classId: number,
    senderId: number,
    senderName: string,
    senderRole: string,
    message: string,
    attachments: string[] = [],
  ) {
    const newMsg = new this.messageModel({
      classId,
      senderId,
      senderName,
      senderRole,
      message,
      attachments,
    });
    return newMsg.save();
  }

  /**
   * Lấy lịch sử tin nhắn của lớp (mặc định 50 tin gần nhất)
   */
  async getMessageHistory(classId: number, limit = 50) {
    const messages = await this.messageModel
      .find({ classId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // Sắp xếp lại từ cũ đến mới để hiển thị đúng thứ tự hội thoại
    return messages.reverse();
  }

  /**
   * Tạo thông báo lớp mới
   */
  async createAnnouncement(
    classId: number,
    authorId: number,
    authorName: string,
    dto: CreateAnnouncementDto,
  ) {
    const announcement = new this.announcementModel({
      classId,
      title: dto.title,
      content: dto.content,
      authorId,
      authorName,
      isPinned: dto.isPinned || false,
    });
    return announcement.save();
  }

  /**
   * Lấy danh sách thông báo của lớp học (tin ghim lên đầu)
   */
  async getAnnouncements(classId: number) {
    return this.announcementModel
      .find({ classId })
      .sort({ isPinned: -1, createdAt: -1 })
      .exec();
  }
}
