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
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 md:p-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">
        {initial}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-base font-semibold text-foreground">{email}</span>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
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
