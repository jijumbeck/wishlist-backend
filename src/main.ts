import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
      .setTitle('Wishlist Service API')
      .setDescription('Документация REST API Wishlist Service')
      .setVersion('1.0.0')
      .build()
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/swagger', app, document);

    app.use(cookieParser());

    await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
  } catch (e) {
    console.log(e)
  }
}
bootstrap();
