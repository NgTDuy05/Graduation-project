import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function getDatabaseSslCa(): string | undefined {
  const caPath = process.env.MYSQL_SSL_CA || 'certs/isrgrootx.pem';
  const fullPath = resolve(process.cwd(), caPath);
  return existsSync(fullPath) ? readFileSync(fullPath, 'utf8') : undefined;
}

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  const useSsl = process.env.MYSQL_SSL === 'true';
  const sslCa = useSsl ? getDatabaseSslCa() : undefined;

  return {
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'smartlearn_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.MYSQL_SYNCHRONIZE === 'true',
    autoLoadEntities: true,
    charset: 'utf8mb4',

    ...(useSsl && {
      ssl: {
        ca: sslCa,
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
    }),
  };
};


export const getMongooseConfig = (): MongooseModuleOptions => ({
  uri: process.env.MONGODB_URI || 'mongodb+srv://duynguyenth2004_db_user:Ngtduy05%402004@cluster0.k3tli5.mongodb.net/smartlearn_db?retryWrites=true&w=majority',
});
