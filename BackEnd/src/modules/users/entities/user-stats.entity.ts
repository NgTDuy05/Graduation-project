import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_stats')
export class UserStats {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, (user) => user.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'streak_days', default: 0 })
  streakDays: number;

  @Column({ name: 'last_active_date', type: 'date', nullable: true })
  lastActiveDate: Date;

  @Column({ name: 'lightning_points', default: 0 })
  lightningPoints: number;

  @Column({ name: 'rank_tier', length: 30, default: 'Đồng' })
  rankTier: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
