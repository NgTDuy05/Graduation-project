import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'unilearn_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.MYSQL_SYNCHRONIZE === 'true',
  autoLoadEntities: true,
  charset: 'utf8mb4',
});

export const getMongooseConfig = (): MongooseModuleOptions => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/unilearn_db',
});
