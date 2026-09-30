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
import { User } from '../../users/entities/user.entity';
import { ClassMember } from './class-member.entity';
import { Assignment } from './assignment.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'tinyint', comment: 'Khối lớp từ 6 đến 12' })
  grade: number;

  @Column({ length: 50, comment: 'Môn học' })
  subject: string;

  @Column({ name: 'class_code', length: 8, unique: true, comment: 'Mã lớp 8 ký tự' })
  classCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @OneToMany(() => ClassMember, (member) => member.class)
  members: ClassMember[];

  @OneToMany(() => Assignment, (assignment) => assignment.class)
  assignments: Assignment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
