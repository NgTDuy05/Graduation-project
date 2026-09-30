import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, CourseSchema } from './schemas/course.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { UserProgress, UserProgressSchema } from './schemas/user-progress.schema';
import { UserStats } from '../users/entities/user-stats.entity';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
    ]),
    TypeOrmModule.forFeature([UserStats]),
  ],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
