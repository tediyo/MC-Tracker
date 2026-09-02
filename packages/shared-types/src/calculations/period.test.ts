import { describe, expect, it } from "vitest";
import { getPeriodRange } from "./period";

// Sunday, August 9, 2026 — a fixed reference date so every assertion below is deterministic.
const REFERENCE = new Date(2026, 7, 9);

describe("getPeriodRange", () => {
  it("daily: returns the single day and the day before", () => {
    const range = getPeriodRange("daily", REFERENCE);
    expect(range.start.toDateString()).toBe(new Date(2026, 7, 9).toDateString());
    expect(range.end.toDateString()).toBe(new Date(2026, 7, 9).toDateString());
    expect(range.previousStart.toDateString()).toBe(new Date(2026, 7, 8).toDateString());
  });

  it("weekly: uses an ISO (Monday-start) week", () => {
    const range = getPeriodRange("weekly", REFERENCE);
    // Aug 9, 2026 is a Sunday -> the ISO week containing it starts Mon Aug 3.
    expect(range.start.getDay()).toBe(1); // Monday
    expect(range.start.toDateString()).toBe(new Date(2026, 7, 3).toDateString());
    expect(range.end.toDateString()).toBe(new Date(2026, 7, 9).toDateString());
    expect(range.previousStart.toDateString()).toBe(new Date(2026, 6, 27).toDateString());
  });

  it("monthly: spans the full Ethiopian calendar month", () => {
    const range = getPeriodRange("monthly", REFERENCE);
    // Aug 9, 2026 is Nehase 3, 2018 E.C. -> Nehase 2018 starts Aug 7, 2026 and ends Sep 5, 2026
    expect(range.start.toDateString()).toBe(new Date(2026, 7, 7).toDateString());
    expect(range.end.toDateString()).toBe(new Date(2026, 8, 5).toDateString());
    expect(range.previousStart.toDateString()).toBe(new Date(2026, 6, 8).toDateString());
    expect(range.previousEnd.toDateString()).toBe(new Date(2026, 7, 6).toDateString());
  });

  it("yearly: spans the full Ethiopian calendar year", () => {
    const range = getPeriodRange("yearly", REFERENCE);
    // 2018 E.C. starts Sep 12, 2025 (Meskerem 1, 2018)
    expect(range.start.getFullYear()).toBe(2025);
    expect(range.previousStart.getFullYear()).toBe(2024);
  });

  it("monthly: correctly rolls Ethiopian Meskerem back to Pagume/Nehase", () => {
    const meskerem = new Date(2026, 8, 15); // Sep 15, 2026 = Meskerem 5, 2019 E.C.
    const range = getPeriodRange("monthly", meskerem);
    expect(range.previousStart.getFullYear()).toBe(2026);
    expect(range.label).toBe("Meskerem 2019 E.C.");
  });
});
