import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitExamAttemptDto {
  @ApiProperty({
    example: { q1: 1, q2: 0, q3: 2 },
    description: 'Map câu hỏi ID -> Lựa chọn của học sinh (index 0, 1, 2, 3)',
  })
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, number>;

  @ApiProperty({ example: 1250, description: 'Thời gian làm bài tính bằng giây' })
  @IsNumber()
  durationSeconds: number;
}
