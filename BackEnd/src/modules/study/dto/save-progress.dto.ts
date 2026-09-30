import { IsBoolean, IsNumber, IsOptional, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveProgressDto {
  @ApiProperty({ example: 'toan-12-ham-so', description: 'Slug của khóa học' })
  @IsString()
  courseSlug: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  completedTheory?: boolean;

  @ApiProperty({ example: ['fc_1', 'fc_2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learnedFlashcardIds?: string[];

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  practiceScore?: number;

  @ApiProperty({ example: ['q_2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wrongQuestionIds?: string[];
}
