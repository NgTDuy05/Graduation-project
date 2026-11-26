import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlanType } from '../entities/subscription.entity';

export class UpgradeSubscriptionDto {
  @ApiProperty({ enum: PlanType, example: PlanType.PRO })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiProperty({ example: 1, description: 'Số tháng đăng ký (1 hoặc 12)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMonths?: number;
}

