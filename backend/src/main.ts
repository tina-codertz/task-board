import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  

  //enable frontend connection
  app.enableCors({
    origin:"http://localhost:5173", //this is the vite url
    credentials:true
  })
  await app.listen(process.env.PORT ?? 3001);
  console.log("the backend is running on port 3001")
}
bootstrap();
