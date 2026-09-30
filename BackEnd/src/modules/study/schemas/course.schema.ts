import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ _id: false })
export class LessonOutline {
  @Prop({ required: true })
  lessonId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: 15 })
  durationMinutes: number;

  @Prop({ required: true })
  order: number;
}

export const LessonOutlineSchema = SchemaFactory.createForClass(LessonOutline);

@Schema({ _id: false })
export class ChapterOutline {
  @Prop({ required: true })
  chapterId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: [LessonOutlineSchema], default: [] })
  lessons: LessonOutline[];
}

export const ChapterOutlineSchema = SchemaFactory.createForClass(ChapterOutline);

@Schema({ collection: 'courses', timestamps: true })
export class Course {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true, index: true })
  grade: number;

  @Prop()
  thumbnail: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  totalLessons: number;

  @Prop({ type: [ChapterOutlineSchema], default: [] })
  chapters: ChapterOutline[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
