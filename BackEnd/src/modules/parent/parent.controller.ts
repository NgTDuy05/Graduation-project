import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParentService } from './parent.service';
import { LinkStudentDto } from './dto/link-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Phụ Huynh & Theo Dõi Học Tập (Parent Module)')
@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PHU_HUYNH)
@ApiBearerAuth('JWT-auth')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('children')
  @ApiOperation({ summary: 'Lấy danh sách học sinh đã liên kết với phụ huynh' })
  getLinkedChildren(@CurrentUser('id') parentId: number) {
    return this.parentService.getLinkedChildren(parentId);
  }

  @Post('children/link')
  @ApiOperation({ summary: 'Liên kết tài khoản phụ huynh với con bằng Mã học sinh 6 ký tự' })
  linkChildByCode(
    @CurrentUser('id') parentId: number,
    @Body() dto: LinkStudentDto,
  ) {
    return this.parentService.linkChildByCode(parentId, dto);
  }

  @Delete('children/:studentId')
  @ApiOperation({ summary: 'Hủy liên kết theo dõi học sinh' })
  unlinkChild(
    @CurrentUser('id') parentId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.parentService.unlinkChild(parentId, studentId);
  }

  @Get('children/:studentId/overview')
  @ApiOperation({
    summary: 'Xem báo cáo toàn diện về tiến độ học bài, bài tập, điểm thi và thông báo lớp của con',
  })
  getChildOverview(
    @CurrentUser('id') parentId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.parentService.getChildOverview(parentId, studentId);
  }
}

