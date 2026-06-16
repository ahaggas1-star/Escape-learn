import { describe, it, expect } from "vitest";
import { longestStreak } from "./streak";

describe("longestStreak", () => {
  it("returns 0 for no activity", () => {
    expect(longestStreak([])).toBe(0);
  });

  it("counts 5 consecutive days", () => {
    expect(
      longestStreak([
        "2026-06-01T10:00:00Z",
        "2026-06-02T08:00:00Z",
        "2026-06-03T22:00:00Z",
        "2026-06-04T07:00:00Z",
        "2026-06-05T19:00:00Z",
      ])
    ).toBe(5);
  });

  it("ignores duplicate days and resets on a gap", () => {
    expect(
      longestStreak([
        "2026-06-01T01:00:00Z",
        "2026-06-01T09:00:00Z", // مكرر
        "2026-06-03T01:00:00Z", // فجوة
        "2026-06-04T01:00:00Z",
      ])
    ).toBe(2);
  });

  it("handles month boundaries", () => {
    expect(longestStreak(["2026-05-30", "2026-05-31", "2026-06-01"])).toBe(3);
  });

  it("returns 1 for a single day", () => {
    expect(longestStreak(["2026-06-10T12:00:00Z"])).toBe(1);
  });
});
