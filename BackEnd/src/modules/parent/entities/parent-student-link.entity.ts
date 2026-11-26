import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('parent_student_links')
@Unique(['parentId', 'studentId'])
export class ParentStudentLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_id' })
  parentId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ length: 50, default: 'Phụ huynh' })
  relationship: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

