"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getEthiopianDate, ETHIOPIAN_MONTHS, type TimeFrame } from "@mc-tracker/shared-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS: { value: TimeFrame; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

interface TimeframeSwitcherProps {
  timeframe: TimeFrame;
  onTimeframeChange: (timeframe: TimeFrame) => void;
  periodLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function TimeframeSwitcher({
  timeframe,
  onTimeframeChange,
  periodLabel,
  onPrevious,
  onNext,
}: TimeframeSwitcherProps) {
  const ethToday = getEthiopianDate(new Date());
  const ethMonth = ETHIOPIAN_MONTHS.find((m) => m.number === ethToday.month);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card/50 p-2.5 rounded-2xl border border-border/50 shadow-sm">
      {/* Segmented Pills */}
      <div className="inline-flex rounded-xl bg-muted/80 p-1 border border-border/40 shadow-inner">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTimeframeChange(opt.value)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              timeframe === opt.value
                ? "bg-emerald-500 text-white shadow-sm scale-100"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Date Range Controls */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          aria-label="Previous period"
          className="h-8 w-8 rounded-lg border-border/60 hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4 text-emerald-500" />
        </Button>

        <div className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
            <span className="min-w-28 text-center capitalize">{periodLabel}</span>
          </div>
          <span className="text-[10px] font-normal text-muted-foreground">
            {ethMonth?.nameEn} {ethToday.year} E.C.
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          aria-label="Next period"
          className="h-8 w-8 rounded-lg border-border/60 hover:bg-accent"
        >
          <ChevronRight className="h-4 w-4 text-emerald-500" />
        </Button>
      </div>
    </div>
  );
}
