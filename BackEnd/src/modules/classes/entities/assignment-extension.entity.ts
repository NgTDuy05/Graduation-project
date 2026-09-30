import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Assignment } from './assignment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('assignment_extensions')
export class AssignmentExtension {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'assignment_id' })
  assignmentId: number;

  @Column({
    name: 'student_id',
    nullable: true,
    comment: 'Nếu null là gia hạn chung cho cả lớp',
  })
  studentId: number | null;

  @Column({ name: 'extended_deadline', type: 'datetime' })
  extendedDeadline: Date;

  @Column({ length: 255, nullable: true })
  reason: string;

  @ManyToOne(() => Assignment, (assignment) => assignment.extensions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignment_id' })
  assignment: Assignment;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
