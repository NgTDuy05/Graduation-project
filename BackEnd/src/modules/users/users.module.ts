import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserStats } from './entities/user-stats.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserStats])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
