import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ _id: false })
export class FlashcardItem {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  term: string;

  @Prop({ required: true })
  definition: string;

  @Prop()
  example: string;

  @Prop({ default: 'medium' })
  difficulty: string;
}

export const FlashcardItemSchema = SchemaFactory.createForClass(FlashcardItem);

@Schema({ _id: false })
export class PracticeQuestionItem {
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
}

export const PracticeQuestionItemSchema = SchemaFactory.createForClass(PracticeQuestionItem);

@Schema({ collection: 'lessons', timestamps: true })
export class Lesson {
  @Prop({ required: true, unique: true, index: true })
  lessonId: string;

  @Prop({ required: true, index: true })
  courseSlug: string;

  @Prop({ required: true })
  chapterId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  theoryContent: string;

  @Prop()
  videoUrl: string;

  @Prop({ type: [String], default: [] })
  summary: string[];

  @Prop({ type: [FlashcardItemSchema], default: [] })
  flashcards: FlashcardItem[];

  @Prop({ type: [PracticeQuestionItemSchema], default: [] })
  practiceQuestions: PracticeQuestionItem[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
