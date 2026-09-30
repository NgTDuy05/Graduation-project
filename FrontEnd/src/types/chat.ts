export interface ChatMessage {
  _id?: string;
  id?: string;
  classId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface Announcement {
  _id?: string;
  id?: string;
  classId: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  isPinned: boolean;
  createdAt: string;
}

export interface OnlineUser {
  userId: number;
  userName: string;
}
