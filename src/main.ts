import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
      .setTitle('Wishlist Service API')
      .setDescription('Документация REST API Wishlist Service')
      .setVersion('1.0.0')
      .build()
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/swagger', app, document);

    app.use(cookieParser());

    app.enableCors({
      origin: 'http://localhost:3000',
      allowedHeaders: ['Access-Control-Allow-Origin', 'Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'Authorization'],
      credentials: true
    })

    await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
  } catch (e) {
    console.log(e)
  }
}
bootstrap();
