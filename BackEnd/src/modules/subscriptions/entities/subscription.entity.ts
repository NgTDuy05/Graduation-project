import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    name: 'plan_type',
    type: 'enum',
    enum: PlanType,
    default: PlanType.FREE,
  })
  planType: PlanType;

  @Column({ name: 'start_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime', nullable: true })
  endDate: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

