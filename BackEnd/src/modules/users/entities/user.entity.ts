import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { UserStats } from './user-stats.entity';

export enum UserRole {
  HOC_SINH = 'HOC_SINH',
  GIAO_VIEN = 'GIAO_VIEN',
  PHU_HUYNH = 'PHU_HUYNH',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.HOC_SINH,
  })
  role: UserRole;

  @Column({
    name: 'student_code',
    length: 6,
    unique: true,
    nullable: true,
    comment: 'Mã định danh duy nhất 6 ký tự viết hoa cho học sinh',
  })
  studentCode: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ name: 'refresh_token', length: 255, nullable: true, select: false })
  refreshToken: string;

  @OneToOne(() => UserStats, (stats) => stats.user, { cascade: true })
  stats: UserStats;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
