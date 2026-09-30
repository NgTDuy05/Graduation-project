import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinClassDto {
  @ApiProperty({ example: 'CLS8X9Y2', description: 'Mã lớp học gồm 8 ký tự' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã lớp học' })
  @Length(6, 10, { message: 'Mã lớp học không hợp lệ' })
  classCode: string;
}

export class AddStudentByCodeDto {
  @ApiProperty({ example: 'ABC123', description: 'Mã học sinh gồm 6 ký tự' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã học sinh' })
  @Length(6, 6, { message: 'Mã học sinh phải có đúng 6 ký tự' })
  studentCode: string;
}
