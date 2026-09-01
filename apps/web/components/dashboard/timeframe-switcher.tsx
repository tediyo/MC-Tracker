"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getEthiopianDate, ETHIOPIAN_MONTHS, type TimeFrame } from "@mc-tracker/shared-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarMode } from "@/components/providers/calendar-provider";

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
  referenceDate: Date;
  calendarMode: CalendarMode;
  onPrevious: () => void;
  onNext: () => void;
}

export function TimeframeSwitcher({
  timeframe,
  onTimeframeChange,
  periodLabel,
  referenceDate,
  calendarMode,
  onPrevious,
  onNext,
}: TimeframeSwitcherProps) {
  const eth = getEthiopianDate(referenceDate);
  const ethMonthObj = ETHIOPIAN_MONTHS.find((m) => m.number === eth.month);

  const ethLabel = React.useMemo(() => {
    if (timeframe === "monthly") {
      return `${ethMonthObj?.nameEn || ""} ${eth.year} E.C. (${ethMonthObj?.nameAm || ""} ${eth.year} ዓ.ም.)`;
    }
    if (timeframe === "yearly") {
      return `${eth.year} E.C. (${eth.year} ዓ.ም.)`;
    }
    if (timeframe === "daily") {
      return `${ethMonthObj?.nameEn || ""} ${eth.day}, ${eth.year} E.C.`;
    }
    return `${ethMonthObj?.nameEn || ""} Wk, ${eth.year} E.C.`;
  }, [timeframe, eth, ethMonthObj]);

  const isEthiopian = calendarMode === "ethiopian";
  const primaryTitle = isEthiopian ? ethLabel : periodLabel;
  const secondarySubtitle = isEthiopian ? periodLabel : ethLabel;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card/50 p-2.5 rounded-2xl border border-border/50 shadow-sm">
      {/* Segmented Timeframe Pills */}
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

      {/* Date Navigation */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Step Prev Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          aria-label="Previous period"
          className="h-9 w-9 rounded-xl border-border/60 hover:bg-accent shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 text-emerald-500" />
        </Button>

        {/* Date Display Pill */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card px-4 py-1 text-xs font-semibold text-foreground shadow-sm min-w-44 text-center">
          <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{primaryTitle}</span>
          </div>
          <span className="text-[10px] font-normal text-muted-foreground mt-0.5">
            {secondarySubtitle}
          </span>
        </div>

        {/* Step Next Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          aria-label="Next period"
          className="h-9 w-9 rounded-xl border-border/60 hover:bg-accent shadow-sm"
        >
          <ChevronRight className="h-4 w-4 text-emerald-500" />
        </Button>
      </div>
    </div>
  );
}
