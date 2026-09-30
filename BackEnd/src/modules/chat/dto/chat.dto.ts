import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 1, description: 'ID lớp học' })
  @IsNumber()
  classId: number;

  @ApiProperty({ example: 'Thưa Thầy, bài tập số 3 em giải theo cách này có đúng không ạ?' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  message: string;
}

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Lịch học bù môn Toán vào sáng thứ 7' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề thông báo không được để trống' })
  title: string;

  @ApiProperty({ example: 'Các em chú ý sáng thứ Bảy lớp chúng ta sẽ có buổi ôn tập lúc 8h00 nhé.' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung thông báo không được để trống' })
  content: string;

  @ApiProperty({ example: true, required: false, description: 'Ghim thông báo lên đầu lớp' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
