// MUST be the first import: populates process.env from .env synchronously,
// before any other file (e.g. a cron job reading APP_TIMEZONE for its
// @Cron decorator at class-definition time) gets imported and evaluated.
import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.WEB_APP_URL ?? "*" });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  Logger.log(`MC Tracker API listening on port ${port}`, "Bootstrap");
}

bootstrap();
