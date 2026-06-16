import { describe, it, expect } from "vitest";
import { computeLevelProgress, type Level } from "./progress";

const LEVELS: Level[] = [
  { id: "1", key: "seed", label_ar: "بذرة", min_xp: 0, sort_order: 1 },
  { id: "2", key: "seedling", label_ar: "غرسة", min_xp: 100, sort_order: 2 },
  { id: "3", key: "sprout", label_ar: "نبتة", min_xp: 300, sort_order: 3 },
];

describe("computeLevelProgress", () => {
  it("starts at the first level with 0 XP", () => {
    const p = computeLevelProgress(0, LEVELS);
    expect(p.level?.key).toBe("seed");
    expect(p.nextLevel?.key).toBe("seedling");
    expect(p.progressPct).toBe(0);
  });

  it("computes midway progress to the next level", () => {
    const p = computeLevelProgress(50, LEVELS);
    expect(p.level?.key).toBe("seed");
    expect(p.xpIntoLevel).toBe(50);
    expect(p.xpForNextLevel).toBe(100);
    expect(p.progressPct).toBe(50);
  });

  it("advances to the next level at its threshold", () => {
    const p = computeLevelProgress(100, LEVELS);
    expect(p.level?.key).toBe("seedling");
    expect(p.nextLevel?.key).toBe("sprout");
    expect(p.progressPct).toBe(0);
  });

  it("caps at 100% on the highest level", () => {
    const p = computeLevelProgress(500, LEVELS);
    expect(p.level?.key).toBe("sprout");
    expect(p.nextLevel).toBeNull();
    expect(p.progressPct).toBe(100);
    expect(p.xpForNextLevel).toBeNull();
  });

  it("sorts unsorted levels before computing", () => {
    const shuffled = [LEVELS[2], LEVELS[0], LEVELS[1]];
    const p = computeLevelProgress(150, shuffled);
    expect(p.level?.key).toBe("seedling");
  });
});
