import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // Enable CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global API Prefix
  app.setGlobalPrefix('api');

  // HTTP Request Logger Middleware
  app.use((req: any, res: any, next: any) => {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const statusColor =
        statusCode >= 500
          ? '\x1b[31m' // Red
          : statusCode >= 400
            ? '\x1b[33m' // Yellow
            : statusCode >= 300
              ? '\x1b[36m' // Cyan
              : '\x1b[32m'; // Green
      const reset = '\x1b[0m';
      const methodColor =
        method === 'GET'
          ? '\x1b[32m' // Green
          : method === 'POST'
            ? '\x1b[34m' // Blue
            : method === 'DELETE'
              ? '\x1b[31m' // Red
              : method === 'PATCH'
                ? '\x1b[33m' // Yellow
                : '\x1b[35m'; // Magenta

      console.log(
        `${methodColor}[${method.padEnd(6)}]${reset} ${originalUrl} ${statusColor}${statusCode}${reset} (${duration}ms)`
      );
    });

    next();
  });

  // Hỗ trợ endpoint /login & /api/login để GET /login trả về 200 OK
  app.use(['/login', '/api/login'], (req: any, res: any, next: any) => {
    if (req.method === 'GET') {
      return res.status(200).json({
        statusCode: 200,
        message: 'Unilearn Login API. Vui lòng gửi POST /api/auth/login để đăng nhập.',
        endpoints: {
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          docs: '/api/docs',
        },
      });
    }
    next();
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Unilearn API Documentation')
    .setDescription('Tài liệu API nền tảng học tập trực tuyến Unilearn ("Học thông minh")')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`\n======================================================`);
  console.log(`🚀 Unilearn Backend API đang chạy tại: http://localhost:${port}/api`);
  console.log(`📖 Swagger API Docs tại: http://localhost:${port}/api/docs`);
  console.log(`======================================================\n`);
}
bootstrap();
