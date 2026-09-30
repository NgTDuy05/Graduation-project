import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema({ _id: false })
export class ExamQuestionItem {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true })
  correctIndex: number;

  @Prop({ required: true })
  explanation: string;

  @Prop({ default: 'medium' })
  difficulty: string;
}

export const ExamQuestionItemSchema = SchemaFactory.createForClass(ExamQuestionItem);

@Schema({ collection: 'exams', timestamps: true })
export class Exam {
  @Prop({ required: true, unique: true, index: true })
  examId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, index: true })
  subject: string;

  @Prop({ required: true, index: true })
  grade: number;

  @Prop({ required: true, default: 45 })
  durationMinutes: number;

  @Prop({ required: true, default: 20 })
  totalQuestions: number;

  @Prop()
  description: string;

  @Prop({ type: [ExamQuestionItemSchema], default: [] })
  questions: ExamQuestionItem[];
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
