import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { getTypeOrmConfig, getMongooseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { StudyModule } from './modules/study/study.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ChatModule } from './modules/chat/chat.module';
import { PracticeModule } from './modules/practice/practice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getTypeOrmConfig(),
    }),
    MongooseModule.forRootAsync({
      useFactory: () => getMongooseConfig(),
    }),
    UsersModule,
    AuthModule,
    GamificationModule,
    StudyModule,
    ClassesModule,
    ChatModule,
    PracticeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
