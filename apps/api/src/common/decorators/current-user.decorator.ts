import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { RequestUser } from "../guards/supabase-auth.guard";

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest<Request & { user?: RequestUser }>();
  if (!request.user) throw new Error("CurrentUser decorator used without SupabaseAuthGuard");
  return request.user;
});
