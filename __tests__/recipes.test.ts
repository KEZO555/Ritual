import {
  brewTimeBucket,
  categoriesForMethod,
  convertStepTemps,
  type Filters,
  filterRecipes,
  formatDuration,
  getGrinder,
  getRecipe,
  grinderClicks,
  recipeMetaLabel,
  scaleRecipe,
  sortRecipes,
  toDisplayTemp,
} from "../data/recipes";

const EMPTY_FILTERS: Filters = {
  brewTime: null,
  grind: null,
  method: null,
  orientation: null,
  query: "",
  roast: null,
};

describe("formatDuration", () => {
  it("formats sub-minute as seconds", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(45)).toBe("45s");
  });
  it("formats minutes", () => {
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(210)).toBe("3:30");
  });
});

describe("brewTimeBucket", () => {
  it("buckets by total seconds", () => {
    expect(brewTimeBucket(60)).toBe("short");
    expect(brewTimeBucket(119)).toBe("short");
    expect(brewTimeBucket(200)).toBe("medium");
    expect(brewTimeBucket(300)).toBe("medium");
    expect(brewTimeBucket(330)).toBe("long");
  });
});

describe("toDisplayTemp / convertStepTemps", () => {
  it("keeps Celsius, converts Fahrenheit", () => {
    expect(toDisplayTemp(92, "C")).toBe(92);
    expect(toDisplayTemp(100, "F")).toBe(212);
    expect(toDisplayTemp(0, "F")).toBe(32);
  });
  it("rewrites embedded step temps only for Fahrenheit", () => {
    expect(convertStepTemps("Pour at 100C", "C")).toBe("Pour at 100C");
    expect(convertStepTemps("Pour at 100C", "F")).toBe("Pour at 212F");
    expect(convertStepTemps("Add 20g of coffee", "F")).toBe(
      "Add 20g of coffee"
    );
  });
});

describe("grinderClicks", () => {
  it("returns C40 clicks unchanged for the baseline grinder", () => {
    expect(grinderClicks(28, getGrinder("c40"))).toBe(28);
  });
  it("approximates other grinders from microns-per-click", () => {
    // 28 * 30 / 12.5 = 67.2 -> 67
    expect(grinderClicks(28, getGrinder("jx-pro"))).toBe(67);
  });
});

describe("scaleRecipe", () => {
  const base = getRecipe("james-hoffmann-aeropress-recipe");

  it("scales water with the dose at the same ratio", () => {
    if (!base) {
      throw new Error("base recipe missing");
    }
    const scaled = scaleRecipe(base, base.coffeeGrams * 2, base.roast);
    expect(scaled.coffeeGrams).toBe(base.coffeeGrams * 2);
    expect(scaled.waterGrams).toBe(base.waterGrams * 2);
  });

  it("cools the water and rescales step grams for a darker roast", () => {
    if (!base) {
      throw new Error("base recipe missing");
    }
    const scaled = scaleRecipe(base, base.coffeeGrams * 2, "dark");
    expect(scaled.waterTempC).toBeLessThan(base.waterTempC);
    expect(scaled.roast).toBe("dark");
    expect(scaled.steps[1].instruction).toContain("400g");
  });
});

describe("recipeMetaLabel", () => {
  it("shows method, ratio and time", () => {
    const recipe = getRecipe("james-hoffmann-aeropress-recipe");
    if (!recipe) {
      throw new Error("recipe missing");
    }
    const label = recipeMetaLabel(recipe);
    expect(label).toContain("AeroPress");
    expect(label).toContain("1:");
    expect(label).toContain("3:30");
  });
});

describe("filterRecipes", () => {
  it("matches recipe names case-insensitively", () => {
    const results = filterRecipes({ ...EMPTY_FILTERS, query: "hoffmann" });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((r) => r.name.toLowerCase().includes("hoffmann"))
    ).toBe(true);
  });
  it("filters by method", () => {
    const results = filterRecipes({ ...EMPTY_FILTERS, method: "v60" });
    expect(results.every((r) => r.method === "v60")).toBe(true);
  });
});

describe("sortRecipes", () => {
  const list = filterRecipes({ ...EMPTY_FILTERS, method: "aeropress" });

  it("sorts quickest by total time ascending", () => {
    const sorted = sortRecipes(list, "quick");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].totalSeconds).toBeGreaterThanOrEqual(
        sorted[i - 1].totalSeconds
      );
    }
  });

  it("orders by recently used ids first", () => {
    const target = list[3];
    const sorted = sortRecipes(list, "recent", [target.id]);
    expect(sorted[0].id).toBe(target.id);
  });
});

describe("categoriesForMethod", () => {
  it("returns only categories for the requested method", () => {
    const v60 = categoriesForMethod("v60");
    expect(v60.length).toBeGreaterThan(0);
    expect(v60.every((c) => c.method === "v60")).toBe(true);
  });
});
