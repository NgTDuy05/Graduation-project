import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Bài tập tuần 1: Khảo sát hàm số' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề bài tập không được để trống' })
  title: string;

  @ApiProperty({ example: 'Làm bài tập trang 15 SGK và nộp lại link bài làm', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-10-10T23:59:59.000Z', description: 'Hạn nộp bài tập' })
  @IsDateString({}, { message: 'Hạn nộp phải là định dạng ngày giờ hợp lệ' })
  deadline: string;

  @ApiProperty({ example: true, required: false, description: 'Cho phép nộp muộn sau hạn' })
  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean;
}

export class ExtendDeadlineDto {
  @ApiProperty({ example: '2026-10-15T23:59:59.000Z', description: 'Hạn nộp mới' })
  @IsDateString({}, { message: 'Hạn nộp mới phải là định dạng ngày giờ hợp lệ' })
  extendedDeadline: string;

  @ApiProperty({ example: 'Học sinh xin phép đi thi học sinh giỏi cấp tỉnh', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    example: 5,
    required: false,
    description: 'ID học sinh cần gia hạn. Nếu để trống nghĩa là gia hạn cho cả lớp',
  })
  @IsOptional()
  @IsNumber()
  studentId?: number;
}

export class SubmitAssignmentDto {
  @ApiProperty({
    example: 'Em xin gửi bài giải câu 1-5 theo link Google Drive: https://...',
    description: 'Nội dung nộp bài (văn bản hoặc link nộp bài)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung bài nộp không được để trống' })
  content: string;
}

export class GradeSubmissionDto {
  @ApiProperty({ example: 9.5, description: 'Điểm số từ 0.00 đến 10.00' })
  @IsNumber()
  @Min(0, { message: 'Điểm số tối thiểu là 0' })
  @Max(10, { message: 'Điểm số tối đa là 10' })
  score: number;

  @ApiProperty({ example: 'Bài làm rất tốt, trình bày rõ ràng và chính xác!', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;
}
