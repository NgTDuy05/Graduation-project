import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamAttemptDocument = ExamAttempt & Document;

@Schema({ collection: 'exam_attempts', timestamps: true })
export class ExamAttempt {
  @Prop({ required: true, index: true })
  userId: number;

  @Prop({ required: true, index: true })
  examId: string;

  @Prop({ required: true })
  examTitle: string;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ required: true })
  correctCount: number;

  @Prop({ required: true })
  wrongCount: number;

  @Prop({ required: true })
  unansweredCount: number;

  @Prop({ default: 0 })
  durationSeconds: number;

  @Prop({ type: Object, default: {} })
  answers: Record<string, number>;

  @Prop({ default: Date.now })
  completedAt: Date;
}

export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);
ExamAttemptSchema.index({ userId: 1, completedAt: -1 });
