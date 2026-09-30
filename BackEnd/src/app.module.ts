import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { getTypeOrmConfig, getMongooseConfig } from './config/database.config';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
