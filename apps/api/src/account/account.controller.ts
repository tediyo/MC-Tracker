import { Controller, Delete, HttpCode, HttpStatus, InternalServerErrorException, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { RequestUser } from "../common/guards/supabase-auth.guard";
import { SupabaseService } from "../supabase/supabase.service";

/**
 * The one legitimate CRUD-adjacent endpoint NestJS owns (see the plan's
 * core architecture decision): deleting a Supabase Auth user requires the
 * Admin API, which needs the service-role key - that key must never reach
 * the browser, so the frontend cannot do this itself. `public.users` has
 * `ON DELETE CASCADE` to incomes/costs/plans, so deleting the auth.users
 * row here cleanly removes everything downstream in one transaction,
 * unlike a raw `DELETE FROM users` from the client (see the risk noted in
 * the users-table migration).
 */
@Controller("account")
export class AccountController {
  constructor(private readonly supabase: SupabaseService) {}

  @Delete()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser() user: RequestUser): Promise<void> {
    const { error } = await this.supabase.getClient().auth.admin.deleteUser(user.id);
    if (error) throw new InternalServerErrorException(error.message);
  }
}
