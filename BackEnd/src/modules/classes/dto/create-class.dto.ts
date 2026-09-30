import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ example: 'Toán Học 12A1 - Ôn Thi THPT', description: 'Tên lớp học' })
  @IsString()
  @IsNotEmpty({ message: 'Tên lớp học không được để trống' })
  name: string;

  @ApiProperty({ example: 12, description: 'Khối lớp từ 6 đến 12' })
  @IsNumber()
  @Min(6, { message: 'Khối lớp từ 6 đến 12' })
  @Max(12, { message: 'Khối lớp từ 6 đến 12' })
  grade: number;

  @ApiProperty({ example: 'Toán', description: 'Môn học' })
  @IsString()
  @IsNotEmpty({ message: 'Môn học không được để trống' })
  subject: string;

  @ApiProperty({ example: 'Lớp ôn luyện chuyên sâu môn Toán lớp 12', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
