import { UserCheck } from "lucide-react";
import { formatMonthYear } from "@/lib/utils";

interface ProfileHeaderProps {
  email: string;
  memberSince: string | null;
}

/** Matches the avatar/status-chip language already used in the sidebar
 * footer (components/layout/sidebar.tsx) - same gradient initial circle and
 * emerald "active" dot, just scaled up as the page's own identity banner. */
export function ProfileHeader({ email, memberSince }: ProfileHeaderProps) {
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/90 p-5 shadow-sm md:p-6">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-xl font-bold text-primary-foreground shadow-md shadow-primary/20">
        {initial}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-base font-semibold text-foreground">{email}</span>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 text-emerald-500">
            <UserCheck className="h-3.5 w-3.5" /> Active session
          </span>
          {memberSince ? (
            <>
              <span aria-hidden>·</span>
              <span>Member since {formatMonthYear(memberSince)}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
