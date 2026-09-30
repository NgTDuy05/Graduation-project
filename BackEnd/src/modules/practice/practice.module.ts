import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam, ExamSchema } from './schemas/exam.schema';
import { ExamAttempt, ExamAttemptSchema } from './schemas/exam-attempt.schema';
import { UserStats } from '../users/entities/user-stats.entity';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamAttempt.name, schema: ExamAttemptSchema },
    ]),
    TypeOrmModule.forFeature([UserStats]),
  ],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
