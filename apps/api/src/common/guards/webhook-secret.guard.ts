import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";

/**
 * Guards the Supabase Database Webhook target (POST /webhooks/costs-insert).
 * Supabase calls this endpoint, not a logged-in user, so it's secured with
 * a shared-secret header (configured on both sides - see docs/SETUP.md)
 * rather than the SupabaseAuthGuard's JWT check.
 */
@Injectable()
export class WebhookSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers["x-webhook-secret"];
    const expected = this.config.getOrThrow<string>("SUPABASE_WEBHOOK_SECRET");

    if (!provided || Array.isArray(provided) || provided !== expected) {
      throw new UnauthorizedException("Invalid webhook secret");
    }
    return true;
  }
}
