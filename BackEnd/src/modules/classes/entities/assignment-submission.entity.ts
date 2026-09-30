import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Assignment } from './assignment.entity';
import { User } from '../../users/entities/user.entity';

export enum SubmissionStatus {
  CHUA_LAM = 'CHUA_LAM',
  DANG_LAM = 'DANG_LAM',
  DA_NOP = 'DA_NOP',
  QUA_HAN = 'QUA_HAN',
}

@Entity('assignment_submissions')
@Unique(['assignmentId', 'studentId'])
export class AssignmentSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'assignment_id' })
  assignmentId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.CHUA_LAM,
  })
  status: SubmissionStatus;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ name: 'submitted_at', type: 'datetime', nullable: true })
  submittedAt: Date;

  @Column({ name: 'graded_at', type: 'datetime', nullable: true })
  gradedAt: Date;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignment_id' })
  assignment: Assignment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
