import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'nguyenvana',
    description: 'Tên người dùng (viết liền, không dấu, từ 3-30 ký tự)',
  })
  @IsString({ message: 'Tên người dùng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @MinLength(3, { message: 'Tên người dùng phải có tối thiểu 3 ký tự' })
  @MaxLength(30, { message: 'Tên người dùng tối đa 30 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới',
  })
  username: string;

  @ApiProperty({
    example: 'nguyenvana@gmail.com',
    description: 'Địa chỉ email hợp lệ',
  })
  @IsEmail({}, { message: 'Địa chỉ email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên đầy đủ',
  })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @ApiProperty({
    example: 'MatKhau123@',
    description: 'Mật khẩu tối thiểu 8 ký tự',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu phải có tối thiểu 8 ký tự' })
  password: string;

  @ApiProperty({
    example: 'MatKhau123@',
    description: 'Xác nhận lại mật khẩu',
  })
  @IsString({ message: 'Xác nhận mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Xác nhận mật khẩu phải có tối thiểu 8 ký tự' })
  confirmPassword: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.HOC_SINH,
    description: 'Vai trò: HOC_SINH (Học sinh), GIAO_VIEN (Giáo viên), PHU_HUYNH (Phụ huynh)',
  })
  @IsEnum(UserRole, {
    message: 'Vai trò không hợp lệ. Chọn HOC_SINH, GIAO_VIEN hoặc PHU_HUYNH',
  })
  role: UserRole;
}
