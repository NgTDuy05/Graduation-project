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
import { Class } from './class.entity';

@Entity('class_members')
@Unique(['classId', 'userId'])
export class ClassMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'class_id' })
  classId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    name: 'role_in_class',
    type: 'enum',
    enum: ['STUDENT', 'TEACHER'],
    default: 'STUDENT',
  })
  roleInClass: 'STUDENT' | 'TEACHER';

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED',
  })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ManyToOne(() => Class, (cls) => cls.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
