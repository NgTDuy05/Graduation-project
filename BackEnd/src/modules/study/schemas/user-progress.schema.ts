import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserProgressDocument = UserProgress & Document;

@Schema({ collection: 'user_study_progress', timestamps: true })
export class UserProgress {
  @Prop({ required: true, index: true })
  userId: number;

  @Prop({ required: true, index: true })
  lessonId: string;

  @Prop({ required: true, index: true })
  courseSlug: string;

  @Prop({ default: false })
  completedTheory: boolean;

  @Prop({ type: [String], default: [] })
  learnedFlashcardIds: string[];

  @Prop({ default: 0 })
  practiceScore: number;

  @Prop({ type: [String], default: [] })
  wrongQuestionIds: string[];
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
UserProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
