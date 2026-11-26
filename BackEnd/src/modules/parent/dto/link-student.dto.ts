import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkStudentDto {
  @ApiProperty({ example: 'HS2026', description: 'Mã định danh học sinh gồm 6 ký tự' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Mã học sinh phải gồm đúng 6 ký tự' })
  studentCode: string;

  @ApiProperty({ example: 'Bố', description: 'Mối quan hệ với học sinh', required: false })
  @IsOptional()
  @IsString()
  relationship?: string;
}

