import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ collection: 'announcements', timestamps: true })
export class Announcement {
  @Prop({ required: true, index: true })
  classId: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  authorId: number;

  @Prop({ required: true })
  authorName: string;

  @Prop({ default: false })
  isPinned: boolean;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
AnnouncementSchema.index({ classId: 1, isPinned: -1, createdAt: -1 });
