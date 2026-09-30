import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { User } from '../../users/entities/user.entity';
import { AssignmentExtension } from './assignment-extension.entity';
import { AssignmentSubmission } from './assignment-submission.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'class_id' })
  classId: number;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'datetime' })
  deadline: Date;

  @Column({ name: 'allow_late_submission', default: false })
  allowLateSubmission: boolean;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => Class, (cls) => cls.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  author: User;

  @OneToMany(() => AssignmentExtension, (ext) => ext.assignment)
  extensions: AssignmentExtension[];

  @OneToMany(() => AssignmentSubmission, (sub) => sub.assignment)
  submissions: AssignmentSubmission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
