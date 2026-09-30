import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { ClassMember } from './entities/class-member.entity';
import { Assignment } from './entities/assignment.entity';
import { AssignmentExtension } from './entities/assignment-extension.entity';
import { AssignmentSubmission } from './entities/assignment-submission.entity';
import { User } from '../users/entities/user.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      ClassMember,
      Assignment,
      AssignmentExtension,
      AssignmentSubmission,
      User,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
