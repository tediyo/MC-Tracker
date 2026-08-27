"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ETHIOPIAN_MONTHS, getEthiopianDate } from "@mc-tracker/shared-types";

interface PlanMonthYearPickerProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  /** (month, year) combos that already have a plan - disabled with a tooltip rather than silently accepted then rejected. */
  existingPeriods: ReadonlySet<string>;
}

function periodKey(month: number, year: number) {
  return `${year}-${month}`;
}

export function PlanMonthYearPicker({ month, year, onMonthChange, onYearChange, existingPeriods }: PlanMonthYearPickerProps) {
  const currentEthYear = getEthiopianDate(new Date()).year;
  const years = Array.from({ length: 6 }, (_, i) => currentEthYear - 1 + i);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="plan-month">Month (Ethiopian Calendar)</Label>
        <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
          <SelectTrigger id="plan-month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ETHIOPIAN_MONTHS.map((item) => {
              const disabled = existingPeriods.has(periodKey(item.number, year));
              return (
                <SelectItem key={item.number} value={String(item.number)} disabled={disabled}>
                  {item.label}
                  {disabled ? " (plan exists)" : ""}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="plan-year">Year (E.C. / ዓ.ም.)</Label>
        <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger id="plan-year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y} E.C.
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
