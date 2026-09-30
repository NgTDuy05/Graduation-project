import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

interface UserTypingPayload {
  classId: number;
  userId: number;
  userName: string;
}

interface SendMessagePayload {
  classId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  // Track online users per class: Map<classId, Map<socketId, { userId, userName }>>
  private roomUsers = new Map<number, Map<string, { userId: number; userName: string }>>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client kết nối Socket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ngắt kết nối: ${client.id}`);

    // Xoá user khỏi tất cả các room đang tham gia
    this.roomUsers.forEach((usersMap, classId) => {
      if (usersMap.has(client.id)) {
        usersMap.delete(client.id);
        const onlineUsers = Array.from(usersMap.values());
        this.server.to(`class_${classId}`).emit('room_online_users', {
          classId,
          count: onlineUsers.length,
          users: onlineUsers,
        });
      }
    });
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { classId: number; userId: number; userName: string },
  ) {
    const { classId, userId, userName } = payload;
    const roomName = `class_${classId}`;
    client.join(roomName);

    if (!this.roomUsers.has(classId)) {
      this.roomUsers.set(classId, new Map());
    }
    this.roomUsers.get(classId)?.set(client.id, { userId, userName });

    const onlineUsers = Array.from(this.roomUsers.get(classId)?.values() || []);

    this.logger.log(`User ${userName} (ID: ${userId}) đã tham gia phòng ${roomName}`);

    // Gửi cập nhật danh sách online cho tất cả client trong room
    this.server.to(roomName).emit('room_online_users', {
      classId,
      count: onlineUsers.length,
      users: onlineUsers,
    });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { classId: number },
  ) {
    const { classId } = payload;
    const roomName = `class_${classId}`;
    client.leave(roomName);

    if (this.roomUsers.has(classId)) {
      this.roomUsers.get(classId)?.delete(client.id);
      const onlineUsers = Array.from(this.roomUsers.get(classId)?.values() || []);
      this.server.to(roomName).emit('room_online_users', {
        classId,
        count: onlineUsers.length,
        users: onlineUsers,
      });
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const { classId, senderId, senderName, senderRole, message } = payload;
    const roomName = `class_${classId}`;

    // Lưu vào MongoDB
    const savedMsg = await this.chatService.saveMessage(
      classId,
      senderId,
      senderName,
      senderRole,
      message,
    );

    // Phát tin nhắn realtime cho tất cả thành viên trong lớp
    this.server.to(roomName).emit('new_message', savedMsg);
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UserTypingPayload,
  ) {
    const { classId, userId, userName } = payload;
    client.to(`class_${classId}`).emit('user_typing', { userId, userName, classId });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { classId: number; userId: number },
  ) {
    const { classId, userId } = payload;
    client.to(`class_${classId}`).emit('user_stop_typing', { userId, classId });
  }

  @SubscribeMessage('broadcast_announcement')
  handleBroadcastAnnouncement(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { classId: number; announcement: unknown },
  ) {
    this.server.to(`class_${payload.classId}`).emit('new_announcement', payload.announcement);
  }
}
