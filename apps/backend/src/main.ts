import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as csrf from 'csurf';
import helmet from 'helmet';
import { csrfMiddleware } from './middlewars/csrf';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: [process.env.CORS_HOST, 'http://jwt:3000'],
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
  });

  // app.use(
  //   csrf({
  //     cookie: true,
  //     ignoreMethods: ['GET'],
  //   }),
  // );

  // app.use(csrfMiddleware);

  await app.listen(4000);
}
bootstrap();
