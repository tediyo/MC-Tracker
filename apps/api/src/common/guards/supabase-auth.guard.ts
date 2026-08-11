import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import jwt from "jsonwebtoken";
import type { Request } from "express";

export interface RequestUser {
  id: string;
  email: string;
}

/**
 * Verifies the Supabase session JWT locally (HS256, SUPABASE_JWT_SECRET)
 * rather than calling `supabase.auth.getUser()` over the network on every
 * request - faster, and doesn't add a dependency on Supabase Auth being
 * reachable for this API's tiny REST surface. Attaches the decoded
 * {id, email} onto `request.user` for the `@CurrentUser()` decorator.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const header = request.headers["authorization"];

    if (!header || Array.isArray(header) || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    try {
      const payload = jwt.verify(header.slice("Bearer ".length), this.config.getOrThrow<string>("SUPABASE_JWT_SECRET"), {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      if (typeof payload.sub !== "string") throw new Error("Token missing subject");
      request.user = { id: payload.sub, email: String(payload.email ?? "") };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
