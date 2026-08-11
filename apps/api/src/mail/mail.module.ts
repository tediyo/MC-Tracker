import { join } from "path";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const appPassword = config.get<string>("GMAIL_APP_PASSWORD");
        const auth = appPassword
          ? { user: config.getOrThrow<string>("GMAIL_USER"), pass: appPassword }
          : {
              type: "OAuth2" as const,
              user: config.getOrThrow<string>("GMAIL_USER"),
              clientId: config.get<string>("GOOGLE_OAUTH_CLIENT_ID"),
              clientSecret: config.get<string>("GOOGLE_OAUTH_CLIENT_SECRET"),
              refreshToken: config.get<string>("GOOGLE_OAUTH_REFRESH_TOKEN"),
              // nodemailer auto-refreshes the access token from the refresh
              // token - no accessToken needs to be stored.
            };

        return {
          transport: {
            host: config.get<string>("SMTP_HOST", "smtp.gmail.com"),
            port: config.get<number>("SMTP_PORT", 465),
            secure: true,
            auth,
          },
          defaults: { from: config.get<string>("MAIL_FROM", "MC Tracker <no-reply@example.com>") },
          template: {
            dir: join(__dirname, "templates"),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
