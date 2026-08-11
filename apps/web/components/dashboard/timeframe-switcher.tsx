"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TimeFrame } from "@mc-tracker/shared-types";
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
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex rounded-md border p-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTimeframeChange(opt.value)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              timeframe === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious} aria-label="Previous period">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-40 text-center text-sm font-medium">{periodLabel}</span>
        <Button variant="outline" size="icon" onClick={onNext} aria-label="Next period">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
