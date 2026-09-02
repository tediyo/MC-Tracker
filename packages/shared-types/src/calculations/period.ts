import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  format,
} from "date-fns";

import {
  getEthiopianDate,
  getDaysInEthiopianMonth,
  toGregorianDate,
  ETHIOPIAN_MONTHS,
} from "../ethiopian-calendar";

export const TIME_FRAMES = ["daily", "weekly", "monthly", "yearly"] as const;
export type TimeFrame = (typeof TIME_FRAMES)[number];

/**
 * ISO week: Monday is day 1. This is a documented default (see plan) —
 * revisit if Sun-Sat weeks are wanted instead.
 */
export const WEEK_STARTS_ON = 1 as const;

export interface PeriodRange {
  timeframe: TimeFrame;
  /** Start of the full period containing `referenceDate`. */
  start: Date;
  /** End of the full period containing `referenceDate`. */
  end: Date;
  /** Start of the immediately preceding period of the same length. */
  previousStart: Date;
  /** End of the immediately preceding period of the same length. */
  previousEnd: Date;
  /** Human-readable label for the current period, e.g. "August 2026". */
  label: string;
}

/**
 * Pure function: given a timeframe and an explicit reference date (never
 * `new Date()` internally — the caller always supplies "now"), returns the
 * full period containing that date plus the equivalent previous period.
 * Used as the basis for both period-metric calculations and trend bucketing.
 */
export function getPeriodRange(timeframe: TimeFrame, referenceDate: Date): PeriodRange {
  switch (timeframe) {
    case "daily": {
      const previousRef = subDays(referenceDate, 1);
      return {
        timeframe,
        start: startOfDay(referenceDate),
        end: endOfDay(referenceDate),
        previousStart: startOfDay(previousRef),
        previousEnd: endOfDay(previousRef),
        label: format(referenceDate, "MMM d, yyyy"),
      };
    }
    case "weekly": {
      const start = startOfWeek(referenceDate, { weekStartsOn: WEEK_STARTS_ON });
      const end = endOfWeek(referenceDate, { weekStartsOn: WEEK_STARTS_ON });
      const previousRef = subWeeks(referenceDate, 1);
      return {
        timeframe,
        start,
        end,
        previousStart: startOfWeek(previousRef, { weekStartsOn: WEEK_STARTS_ON }),
        previousEnd: endOfWeek(previousRef, { weekStartsOn: WEEK_STARTS_ON }),
        label: `Week of ${format(start, "MMM d, yyyy")}`,
      };
    }
    case "monthly": {
      const eth = getEthiopianDate(referenceDate);
      const daysInMonth = getDaysInEthiopianMonth(eth.year, eth.month);
      const start = startOfDay(toGregorianDate(eth.year, eth.month, 1));
      const end = endOfDay(toGregorianDate(eth.year, eth.month, daysInMonth));

      let prevYear = eth.year;
      let prevMonth = eth.month - 1;
      if (prevMonth < 1) {
        prevMonth = 13;
        prevYear -= 1;
      }
      const daysInPrevMonth = getDaysInEthiopianMonth(prevYear, prevMonth);
      const previousStart = startOfDay(toGregorianDate(prevYear, prevMonth, 1));
      const previousEnd = endOfDay(toGregorianDate(prevYear, prevMonth, daysInPrevMonth));

      const ethMonthObj = ETHIOPIAN_MONTHS.find((m) => m.number === eth.month);
      const label = `${ethMonthObj?.nameEn || "Month"} ${eth.year} E.C.`;

      return {
        timeframe,
        start,
        end,
        previousStart,
        previousEnd,
        label,
      };
    }
    case "yearly": {
      const eth = getEthiopianDate(referenceDate);
      const start = startOfDay(toGregorianDate(eth.year, 1, 1));
      const daysInPagume = getDaysInEthiopianMonth(eth.year, 13);
      const end = endOfDay(toGregorianDate(eth.year, 13, daysInPagume));

      const prevEthYear = eth.year - 1;
      const daysInPrevPagume = getDaysInEthiopianMonth(prevEthYear, 13);
      const previousStart = startOfDay(toGregorianDate(prevEthYear, 1, 1));
      const previousEnd = endOfDay(toGregorianDate(prevEthYear, 13, daysInPrevPagume));

      return {
        timeframe,
        start,
        end,
        previousStart,
        previousEnd,
        label: `${eth.year} E.C.`,
      };
    }
  }
}
