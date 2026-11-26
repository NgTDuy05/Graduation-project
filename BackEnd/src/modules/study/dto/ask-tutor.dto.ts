import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AskTutorDto {
  @ApiProperty({ example: 'toan-12-bai-1', description: 'ID bài học đang học' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ example: 'Thầy/Cô giải thích lại giúp em định lý về tính đơn điệu với ạ' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 'Đơn điệu của hàm số', required: false })
  @IsOptional()
  @IsString()
  lessonTitle?: string;

  @ApiProperty({
    example: 'int_abc123',
    description: 'ID lượt hội thoại trước để duy trì ngữ cảnh với Gemini AI',
    required: false,
  })
  @IsOptional()
  @IsString()
  previousInteractionId?: string;
}
