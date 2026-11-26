import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ParentStudentLink } from './entities/parent-student-link.entity';
import { User } from '../users/entities/user.entity';
import { UserStats } from '../users/entities/user-stats.entity';
import { ClassMember } from '../classes/entities/class-member.entity';
import { Assignment } from '../classes/entities/assignment.entity';
import { AssignmentSubmission } from '../classes/entities/assignment-submission.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { UserProgress, UserProgressSchema } from '../study/schemas/user-progress.schema';
import { Course, CourseSchema } from '../study/schemas/course.schema';
import { ExamAttempt, ExamAttemptSchema } from '../practice/schemas/exam-attempt.schema';
import { Announcement, AnnouncementSchema } from '../chat/schemas/announcement.schema';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParentStudentLink,
      User,
      UserStats,
      ClassMember,
      Assignment,
      AssignmentSubmission,
      Subscription,
    ]),
    MongooseModule.forFeature([
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: Course.name, schema: CourseSchema },
      { name: ExamAttempt.name, schema: ExamAttemptSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
  ],
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule {}

