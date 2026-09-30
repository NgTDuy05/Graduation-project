import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'nguyenvana hoặc nguyenvana@gmail.com',
    description: 'Tên người dùng hoặc địa chỉ email đã đăng ký',
  })
  @IsString({ message: 'Tên đăng nhập hoặc email phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên người dùng hoặc email' })
  identifier: string;

  @ApiProperty({
    example: 'MatKhau123@',
    description: 'Mật khẩu tài khoản',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  password: string;
}
