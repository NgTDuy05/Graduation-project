import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ collection: 'chat_messages', timestamps: true })
export class ChatMessage {
  @Prop({ required: true, index: true })
  classId: number;

  @Prop({ required: true, index: true })
  senderId: number;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  senderRole: string;

  @Prop()
  senderAvatar: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
ChatMessageSchema.index({ classId: 1, createdAt: -1 });
