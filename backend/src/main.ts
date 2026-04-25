import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  
  // Enable global validation pipe for all endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not defined in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties are sent
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );
  
  // Enable CORS with environment-based configuration
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(origin => origin.trim());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  });
  
  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`)
}
bootstrap();
