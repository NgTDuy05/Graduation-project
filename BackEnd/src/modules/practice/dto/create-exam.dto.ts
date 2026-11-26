import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExamQuestionDto {
  @ApiProperty({ example: 'Tìm tập xác định của hàm số y = log2(x - 1)' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: ['(1; +∞)', '[1; +∞)', 'R', '(-∞; 1)'] })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  correctIndex: number;

  @ApiProperty({ example: 'Điều kiện x - 1 > 0 <=> x > 1.' })
  @IsString()
  @IsNotEmpty()
  explanation: string;

  @ApiProperty({ example: 'easy', required: false })
  @IsOptional()
  @IsString()
  difficulty?: string;
}

export class CreateExamDto {
  @ApiProperty({ example: 'Đề Kiểm Tra 15 Phút Toán 12 - Chương 1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Toán' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(6)
  @Max(12)
  grade: number;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(5)
  @Max(180)
  durationMinutes: number;

  @ApiProperty({ example: 'Đề kiểm tra nhanh kiến thức trọng tâm.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [CreateExamQuestionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExamQuestionDto)
  questions: CreateExamQuestionDto[];
}

