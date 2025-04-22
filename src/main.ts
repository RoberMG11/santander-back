import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS for Angular frontend
  app.enableCors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  // Global prefix for all routes
  app.setGlobalPrefix("api")

  await app.listen(3000)
}
bootstrap();
