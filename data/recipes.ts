export type Roast = "light" | "medium" | "dark";
export type Grind = "fine" | "medium" | "coarse";
export type Orientation = "standard" | "inverted";
export type BrewMethod = "aeropress" | "v60" | "orea-o1" | "orea-z1";
export type BrewTime = "short" | "medium" | "long";
export type TempUnit = "C" | "F";

// Recipes store water temperature in Celsius; convert for display per the
// user's chosen unit.
export function toDisplayTemp(celsius: number, unit: TempUnit): number {
  return unit === "F" ? Math.round((celsius * 9) / 5 + 32) : celsius;
}

// Rewrite a "<n>C" temperature embedded in a step instruction to the chosen
// unit (steps are authored/scaled in Celsius).
export function convertStepTemps(instruction: string, unit: TempUnit): string {
  if (unit === "C") {
    return instruction;
  }
  return instruction.replace(
    /(\d+)C/g,
    (_match, celsius) => `${toDisplayTemp(Number(celsius), "F")}F`
  );
}

// Hand grinders the no-scale guide can target. Recipes store Comandante C40
// clicks; other grinders are an APPROXIMATE conversion via published
// microns-per-click figures (burrs/stepping differ, so treat them as a
// starting point and dial in to taste).
export interface Grinder {
  clicksLabel: string;
  id: string;
  micronsPerClick: number;
  name: string;
}

export const GRINDERS: Grinder[] = [
  {
    id: "c40",
    name: "Comandante C40",
    clicksLabel: "C40 clicks",
    micronsPerClick: 30,
  },
  {
    id: "nano",
    name: "Timemore Nano",
    clicksLabel: "Nano clicks",
    micronsPerClick: 24,
  },
  {
    id: "c3",
    name: "Timemore Chestnut C3",
    clicksLabel: "C3 clicks",
    micronsPerClick: 26,
  },
  {
    id: "jx-pro",
    name: "1Zpresso JX-Pro",
    clicksLabel: "JX-Pro clicks",
    micronsPerClick: 12.5,
  },
  {
    id: "j-max",
    name: "1Zpresso J-Max",
    clicksLabel: "J-Max clicks",
    micronsPerClick: 8.8,
  },
  {
    id: "k6",
    name: "KINGrinder K6",
    clicksLabel: "K6 clicks",
    micronsPerClick: 12,
  },
];

const C40_MICRONS_PER_CLICK = GRINDERS[0].micronsPerClick;

export function getGrinder(id: string): Grinder {
  return GRINDERS.find((grinder) => grinder.id === id) ?? GRINDERS[0];
}

// Approximate the chosen grinder's click count from a recipe's C40 clicks.
export function grinderClicks(c40Clicks: number, grinder: Grinder): number {
  return Math.round(
    (c40Clicks * C40_MICRONS_PER_CLICK) / grinder.micronsPerClick
  );
}

export interface Step {
  // Elapsed time from brew start, in seconds. Omit for untimed prep steps.
  at?: number;
  instruction: string;
}

export interface Recipe {
  author: string;
  blurb: string;
  // Comandante C40 clicks from zero (closed burr).
  c40Clicks: number;
  coffeeGrams: number;
  grind: Grind;
  id: string;
  // The brewer this recipe is written for.
  method: BrewMethod;
  name: string;
  // Optional brewing notes/tips from the source (e.g. recommended coffee).
  notes?: string;
  // AeroPress chamber orientation. Omitted for methods without one (e.g. V60).
  orientation?: Orientation;
  roast: Roast;
  steps: Step[];
  // Total brew time in seconds, from pour to finished press.
  totalSeconds: number;
  waterGrams: number;
  waterTempC: number;
}

export const ROAST_LABELS: Record<Roast, string> = {
  light: "Light",
  medium: "Medium",
  dark: "Dark",
};

export const GRIND_LABELS: Record<Grind, string> = {
  fine: "Fine",
  medium: "Medium",
  coarse: "Coarse",
};

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  standard: "Standard",
  inverted: "Inverted",
};

export const METHOD_LABELS: Record<BrewMethod, string> = {
  aeropress: "AeroPress",
  v60: "V60",
  "orea-o1": "Orea O1",
  "orea-z1": "Orea Z1",
};

export const BREW_TIME_LABELS: Record<BrewTime, string> = {
  short: "Under 2 min",
  medium: "2 - 5 min",
  long: "Over 5 min",
};

export function brewTimeBucket(totalSeconds: number): BrewTime {
  if (totalSeconds < 120) {
    return "short";
  }
  if (totalSeconds <= 300) {
    return "medium";
  }
  return "long";
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  if (secs === 0) {
    return `${mins}:00`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const recipes: Recipe[] = [
  {
    id: "james-hoffmann-aeropress-recipe",
    name: "James Hoffmann's Ultimate AeroPress Recipe",
    author: "James Hoffmann",
    blurb:
      "A simple recipe that throws away AeroPress misconceptions like rinsing the filter and preheating.",
    notes:
      "Match the water temperature to the roast — a little cooler for darker roasts. Resting the plunger about 1cm in makes a vacuum that stops the coffee dripping through as it steeps.",
    roast: "light",
    grind: "fine",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 11,
    waterGrams: 200,
    waterTempC: 99,
    c40Clicks: 18,
    totalSeconds: 190,
    steps: [
      {
        instruction: "Set the brewer in standard position with a paper filter.",
      },
      { at: 0, instruction: "Add all 200g of water to fully wet the coffee." },
      {
        at: 10,
        instruction: "Insert the plunger about 1cm to create a vacuum.",
      },
      { at: 120, instruction: "Gently swirl the brewer, then let it settle." },
      { at: 160, instruction: "Press gently for about 30 seconds." },
      { at: 190, instruction: "Serve and enjoy." },
    ],
  },
  {
    id: "13g-that-makes-you-happy",
    name: "13g that makes you happy",
    author: "Sigit Tri",
    blurb:
      "A balanced, sweet cup designed to work across most coffee processes while avoiding under-extraction.",
    notes:
      "Works across almost any coffee process for a balanced, sweet cup that avoids under-extraction. Want more extraction? Add a few extra stirs or lengthen the bloom.",
    roast: "light",
    grind: "coarse",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 13,
    waterGrams: 180,
    waterTempC: 90,
    c40Clicks: 30,
    totalSeconds: 150,
    steps: [
      { instruction: "Set up the AeroPress in the inverted position." },
      { instruction: "Add 13g of coarsely ground coffee." },
      { at: 0, instruction: "Bloom with 30g water, stir 5 times." },
      { at: 30, instruction: "Pour water to 180g total and stir 5 times." },
      { at: 90, instruction: "Flip the AeroPress onto the cup." },
      { at: 95, instruction: "Press slowly for about one minute." },
      { at: 150, instruction: "Wait 20-30 seconds, then serve." },
    ],
  },
  {
    id: "james-hoffmann",
    name: "James Hoffmann (milk-based)",
    author: "James Hoffmann",
    blurb:
      "A concentrated espresso-style shot built to be topped with warm milk for a milk-based drink.",
    notes:
      "Best with a darker roast or espresso blend. Press all the way through, past the bubbling hiss, to get every drop.",
    roast: "dark",
    grind: "fine",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 18,
    waterGrams: 90,
    waterTempC: 100,
    c40Clicks: 14,
    totalSeconds: 120,
    steps: [
      {
        instruction:
          "Preheat and set up the AeroPress inverted with the plunger pushed halfway in.",
      },
      { instruction: "Add 18g of coffee." },
      { at: 0, instruction: "Pour 90g of hot water." },
      {
        at: 10,
        instruction:
          "Stir aggressively to break up all clumps, then attach the lid.",
      },
      { at: 90, instruction: "Flip the AeroPress onto the cup and swirl." },
      {
        at: 100,
        instruction: "Press slowly and gently until just after the hiss.",
      },
      { at: 120, instruction: "Top with warm milk to serve." },
    ],
  },
  {
    id: "love-me-some-acid",
    name: "Love me some acid",
    author: "Kata Muhel",
    blurb:
      "A recipe that brings out the acidy fruitiness of a vibrant light-roast coffee.",
    notes:
      "Use a vibrant light roast for bright, fruity, acidic cups. Brew through rinsed double paper filters.",
    roast: "light",
    grind: "medium",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 20,
    waterGrams: 230,
    waterTempC: 81,
    c40Clicks: 24,
    totalSeconds: 105,
    steps: [
      {
        instruction:
          "Set up the AeroPress inverted and rinse double paper filters with hot water.",
      },
      { at: 0, instruction: "Add 20g coffee and pour 70g water at 81C." },
      { at: 15, instruction: "Swirl the AeroPress for 15 seconds." },
      { at: 30, instruction: "Add the remaining water to reach 230g total." },
      { at: 60, instruction: "Cap the AeroPress." },
      { at: 80, instruction: "Flip the AeroPress onto the cup." },
      { at: 90, instruction: "Begin plunging." },
      { at: 105, instruction: "Finish plunging and serve." },
    ],
  },
  {
    id: "tim-wendelboe",
    name: "Tim Wendelboe",
    author: "Tim Wendelboe",
    blurb:
      "The clean, light-roast recipe served at Tim Wendelboe's cafe in Oslo.",
    notes:
      "Use a light roast. Stir exactly three times — fewer under-extracts, more over-extracts.",
    roast: "light",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 14,
    waterGrams: 200,
    waterTempC: 96,
    c40Clicks: 18,
    totalSeconds: 120,
    steps: [
      { instruction: "Rinse the paper filter for about 10 seconds." },
      { instruction: "Add 14g of ground coffee." },
      { at: 0, instruction: "Pour 200g of water at 96C." },
      {
        at: 15,
        instruction: "Stir 3 times back to front and attach the handle.",
      },
      {
        at: 90,
        instruction: "Remove the handle and stir 3 times back to front.",
      },
      {
        at: 100,
        instruction:
          "Replace the handle and press using body weight into a large cup.",
      },
    ],
  },
  {
    id: "smooothy",
    name: "Smooooothy!",
    author: "AmirHossein Adib",
    blurb: "A smooth, sweet and balanced cup tuned for East African coffees.",
    notes:
      "Best with East African beans (Ethiopia, Kenya). Bloom for 30 seconds, then a single gentle stir for a smooth, balanced cup.",
    roast: "light",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 14,
    waterGrams: 220,
    waterTempC: 92,
    c40Clicks: 20,
    totalSeconds: 130,
    steps: [
      { instruction: "Rinse and preheat two paper filters." },
      {
        instruction:
          "Grind 14g of coffee to medium-fine and add it to the AeroPress.",
      },
      { at: 0, instruction: "Bloom with 40g water for 30 seconds." },
      {
        at: 30,
        instruction:
          "Add 180g more water and seat the plunger without pressing.",
      },
      { at: 90, instruction: "Stir once." },
      { at: 110, instruction: "Press for 20 seconds." },
      { at: 130, instruction: "Enjoy." },
    ],
  },
  {
    id: "aeropress-iced-latte",
    name: "AeroPress Iced Latte",
    author: "Mark C",
    blurb:
      "Dark chocolate, sandalwood and umami seaweed - full bodied with a good kick over ice and milk.",
    notes:
      "Suits dark, full-bodied beans like Monsooned Malabar. Stir continuously through the first 40 seconds, then press straight onto the ice and milk.",
    roast: "dark",
    grind: "medium",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 18,
    waterGrams: 60,
    waterTempC: 92,
    c40Clicks: 18,
    totalSeconds: 140,
    steps: [
      {
        instruction:
          "Grind 18g of beans to medium-fine and wet the paper filter.",
      },
      {
        at: 0,
        instruction:
          "Add the grounds, pour 60g hot water and stir continuously for the first 40 seconds.",
      },
      { at: 40, instruction: "Cap the AeroPress and let it brew." },
      {
        at: 45,
        instruction: "Meanwhile, add 5 ice cubes and 130g milk to a mug.",
      },
      {
        at: 120,
        instruction:
          "Place the AeroPress on the mug and plunge for 20 seconds.",
      },
      { at: 140, instruction: "Serve over the iced milk." },
    ],
  },
  {
    id: "the-only-aeropress-recipe-you-will-ever-need",
    name: "The only AeroPress recipe you'll ever need",
    author: "The Coffee Compass",
    blurb: "A simple, versatile and economical everyday recipe.",
    notes:
      "Any coffee works. Use a true medium grind and double paper filters to cut sediment, and re-seal the crust at 1:00 for even extraction.",
    roast: "medium",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 15,
    waterGrams: 225,
    waterTempC: 98,
    c40Clicks: 25,
    totalSeconds: 270,
    steps: [
      {
        instruction:
          "Grind 15g of coffee medium and place two rinsed filters in the AeroPress.",
      },
      {
        at: 0,
        instruction:
          "Add 225g of near-boiling water briskly and seat the plunger to create a vacuum.",
      },
      {
        at: 60,
        instruction:
          "Remove the plunger, gently break the crust with a spoon, and replace the plunger.",
      },
      { at: 240, instruction: "Slowly push the plunger all the way down." },
      { at: 270, instruction: "Decant and drink." },
    ],
  },
  {
    id: "backpack-of-freedom",
    name: "Two Big Cups - One Brew",
    author: "Niklas",
    blurb: "A larger brew for sharing with a friend or filling a thermos.",
    notes:
      "Great with light roasts like Yirgacheffe. Use 2-3 paper filters for lighter roasts, preheat everything, and top with hot water Americano-style.",
    roast: "light",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 30,
    waterGrams: 400,
    waterTempC: 93,
    c40Clicks: 20,
    totalSeconds: 150,
    steps: [
      {
        instruction:
          "Preheat the server and AeroPress with warm water and rinse the paper filter.",
      },
      {
        instruction:
          "Place the AeroPress on the mug and add 30g of coffee grounds.",
      },
      { at: 0, instruction: "Add 250g of water to near the top." },
      {
        at: 15,
        instruction:
          "Stir gently for 15 seconds, then insert the plunger to stop dripping.",
      },
      { at: 120, instruction: "Begin pressing for 30-40 seconds." },
      { at: 150, instruction: "Add the remaining 150g of water, then serve." },
    ],
  },
  {
    id: "v60-style-aeropress-light",
    name: "V60 Style Aeropress (light roast)",
    author: "skelathon0703",
    blurb: "A V60-style clean brew using a light roast and no bloom.",
    notes:
      "For light roasts: two paper filters, no bloom, no stir. Steep, then stop pressing before the hiss to avoid over-extraction.",
    roast: "light",
    grind: "fine",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 17,
    waterGrams: 260,
    waterTempC: 95,
    c40Clicks: 15,
    totalSeconds: 70,
    steps: [
      {
        instruction:
          "Rinse the filter(s) with hot water and preheat the brewing vessel.",
      },
      { instruction: "Add 17g of fine ground coffee." },
      {
        at: 0,
        instruction: "Quickly add 260g of 95C water with no stir and no bloom.",
      },
      {
        at: 15,
        instruction: "Seat the plunger to create a vacuum and let it steep.",
      },
      {
        at: 50,
        instruction: "Press for 20 seconds, stopping before the hiss.",
      },
      { at: 70, instruction: "Enjoy." },
    ],
  },
  {
    id: "aeropress-espresso",
    name: "AeroPress Espresso",
    author: "Coffee Lovers TV",
    blurb: "An espresso-style shot using a fine grind and high pressure.",
    notes:
      "Medium-dark roast and a fine grind. Pressure is everything — stir to saturate, then plunge as fast as you can. A metal filter is worth a try.",
    roast: "dark",
    grind: "fine",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 20,
    waterGrams: 60,
    waterTempC: 98,
    c40Clicks: 15,
    totalSeconds: 30,
    steps: [
      {
        instruction:
          "Pre-wet the filter and warm the cup, then set up the AeroPress upright.",
      },
      { instruction: "Add 20g of coffee to the chamber." },
      { at: 0, instruction: "Add 60g of boiling water within 10 seconds." },
      {
        at: 10,
        instruction: "Stir for 10 seconds to saturate all the grounds.",
      },
      { at: 20, instruction: "Plunge as quickly as possible." },
    ],
  },
  {
    id: "for-the-sweetest-cup",
    name: "For the sweetest cup",
    author: "Damaring Kalpika",
    blurb:
      "A sweet, clean cup with bright acidity, refined from a championship method.",
    notes:
      "Use sweet, honey-processed beans (e.g. Gayo or Sumatra). Double-filter and add the final water as a bypass after a slow press to keep it clean and sweet.",
    roast: "light",
    grind: "medium",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 24,
    waterGrams: 240,
    waterTempC: 92,
    c40Clicks: 25,
    totalSeconds: 120,
    steps: [
      { instruction: "Pre-wet the double paper filter and warm the cup." },
      { at: 0, instruction: "Pour 60g of water and stir gently 15-20 times." },
      {
        at: 30,
        instruction:
          "Pour 180g of water in a circular motion and stir thoroughly for 10 seconds.",
      },
      { at: 50, instruction: "Cap and wait." },
      { at: 60, instruction: "Flip onto the preheated cup." },
      { at: 65, instruction: "Press slowly for one minute." },
      { at: 120, instruction: "Add 48g of water, stir and serve." },
    ],
  },
  {
    id: "hoffmann-ultimate",
    name: "The Ultimate AeroPress",
    author: "James Hoffmann",
    blurb: "A simple, repeatable cup with very little fuss.",
    roast: "medium",
    grind: "fine",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 11,
    waterGrams: 200,
    waterTempC: 95,
    c40Clicks: 18,
    totalSeconds: 150,
    steps: [
      {
        instruction: "Rinse a paper filter and add 11g of fine ground coffee.",
      },
      { at: 0, instruction: "Pour in 200g of water near boiling." },
      {
        at: 10,
        instruction: "Place plunger on top to stop dripping and wait.",
      },
      {
        at: 120,
        instruction: "Swirl the brewer gently to settle the grounds.",
      },
      { at: 130, instruction: "Press gently for about 20 seconds." },
      {
        at: 150,
        instruction: "Stop pressing when you hear the hiss. Dilute to taste.",
      },
    ],
  },
  {
    id: "wendelboe-classic",
    name: "Nordic Light",
    author: "Tim Wendelboe style",
    blurb: "Bright and tea-like, made for light Scandinavian roasts.",
    roast: "light",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 14,
    waterGrams: 220,
    waterTempC: 94,
    c40Clicks: 26,
    totalSeconds: 135,
    steps: [
      { instruction: "Rinse filter. Add 14g of medium ground coffee." },
      { at: 0, instruction: "Pour 220g of water and stir twice." },
      { at: 30, instruction: "Insert plunger and let it steep." },
      { at: 105, instruction: "Swirl, then press slowly." },
      { at: 135, instruction: "Finish the press." },
    ],
  },
  {
    id: "world-champ-2018",
    name: "Inverted Champion",
    author: "WAC inspired",
    blurb: "A competition-style inverted brew built for clarity and sweetness.",
    roast: "light",
    grind: "medium",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 18,
    waterGrams: 220,
    waterTempC: 82,
    c40Clicks: 25,
    totalSeconds: 90,
    steps: [
      { instruction: "Assemble inverted. Add 18g of medium ground coffee." },
      { at: 0, instruction: "Pour 220g of water at 82C and stir 5 times." },
      { at: 30, instruction: "Cap with a rinsed filter." },
      { at: 60, instruction: "Flip onto the cup carefully." },
      { at: 75, instruction: "Press steadily over 15 seconds." },
      { at: 90, instruction: "Stop before the hiss." },
    ],
  },
  {
    id: "fellow-everyday",
    name: "Everyday Cup",
    author: "Fellow style",
    blurb: "Balanced daily driver for medium roasts.",
    roast: "medium",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 15,
    waterGrams: 230,
    waterTempC: 92,
    c40Clicks: 24,
    totalSeconds: 105,
    steps: [
      { instruction: "Rinse filter, add 15g of medium ground coffee." },
      { at: 0, instruction: "Pour 230g of water and give a quick stir." },
      { at: 45, instruction: "Insert plunger and steep." },
      { at: 90, instruction: "Press over 15 seconds." },
      { at: 105, instruction: "Done." },
    ],
  },
  {
    id: "espresso-style",
    name: "Faux Espresso",
    author: "AeroPress classic",
    blurb: "A short, intense concentrate. Great as a base for milk drinks.",
    roast: "dark",
    grind: "fine",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 20,
    waterGrams: 60,
    waterTempC: 88,
    c40Clicks: 12,
    totalSeconds: 60,
    steps: [
      { instruction: "Rinse filter. Add 20g of fine ground coffee." },
      { at: 0, instruction: "Pour 60g of water and stir quickly." },
      { at: 20, instruction: "Insert plunger." },
      { at: 30, instruction: "Press firmly over 30 seconds." },
      { at: 60, instruction: "Finish. Top with hot water or milk." },
    ],
  },
  {
    id: "bold-dark",
    name: "Bold & Dark",
    author: "AeroPress classic",
    blurb: "Rich, full-bodied cup for darker roasts.",
    roast: "dark",
    grind: "medium",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 17,
    waterGrams: 240,
    waterTempC: 85,
    c40Clicks: 22,
    totalSeconds: 150,
    steps: [
      { instruction: "Assemble inverted. Add 17g of medium ground coffee." },
      { at: 0, instruction: "Pour 240g of water at 85C and stir." },
      { at: 90, instruction: "Cap with rinsed filter and flip onto the cup." },
      { at: 120, instruction: "Press slowly over 30 seconds." },
      { at: 150, instruction: "Stop at the hiss." },
    ],
  },
  {
    id: "cold-bloom",
    name: "Long Bloom Light",
    author: "Third wave",
    blurb: "Extended steep that draws sweetness from delicate light roasts.",
    roast: "light",
    grind: "fine",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 16,
    waterGrams: 230,
    waterTempC: 90,
    c40Clicks: 16,
    totalSeconds: 330,
    steps: [
      { instruction: "Assemble inverted. Add 16g of fine ground coffee." },
      { at: 0, instruction: "Add 50g of water to bloom and stir gently." },
      { at: 45, instruction: "Pour remaining water up to 230g." },
      { at: 290, instruction: "Cap, flip onto the cup." },
      { at: 300, instruction: "Press slowly over 30 seconds." },
      { at: 330, instruction: "Finish." },
    ],
  },
  {
    id: "quick-morning",
    name: "Quick Morning",
    author: "AeroPress classic",
    blurb: "Fast and forgiving when you are short on time.",
    roast: "medium",
    grind: "fine",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 14,
    waterGrams: 200,
    waterTempC: 93,
    c40Clicks: 18,
    totalSeconds: 75,
    steps: [
      { instruction: "Rinse filter. Add 14g of fine ground coffee." },
      { at: 0, instruction: "Pour 200g of water and stir." },
      { at: 30, instruction: "Insert plunger." },
      { at: 45, instruction: "Press over 30 seconds." },
      { at: 75, instruction: "Done." },
    ],
  },
  {
    id: "sweet-spot",
    name: "Sweet Spot",
    author: "Barista pick",
    blurb: "Caramel sweetness and a syrupy body from medium roasts.",
    roast: "medium",
    grind: "coarse",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 18,
    waterGrams: 250,
    waterTempC: 90,
    c40Clicks: 30,
    totalSeconds: 165,
    steps: [
      { instruction: "Assemble inverted. Add 18g of coarse ground coffee." },
      { at: 0, instruction: "Pour 250g of water and stir 3 times." },
      { at: 120, instruction: "Cap and flip onto the cup." },
      { at: 140, instruction: "Press over 25 seconds." },
      { at: 165, instruction: "Finish." },
    ],
  },
  {
    id: "high-extract-light",
    name: "High Extraction Light",
    author: "Competition style",
    blurb: "Higher dose and agitation to fully develop bright roasts.",
    roast: "light",
    grind: "fine",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 20,
    waterGrams: 200,
    waterTempC: 96,
    c40Clicks: 15,
    totalSeconds: 180,
    steps: [
      { instruction: "Assemble inverted. Add 20g of fine ground coffee." },
      { at: 0, instruction: "Pour 200g of water at 96C and stir vigorously." },
      { at: 60, instruction: "Stir again." },
      { at: 150, instruction: "Cap and flip onto the cup." },
      { at: 165, instruction: "Press over 15 seconds." },
      { at: 180, instruction: "Finish." },
    ],
  },
  {
    id: "smooth-dark",
    name: "Smooth Dark",
    author: "AeroPress classic",
    blurb: "Low temperature brew that tames bitterness in dark roasts.",
    roast: "dark",
    grind: "coarse",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 16,
    waterGrams: 240,
    waterTempC: 80,
    c40Clicks: 32,
    totalSeconds: 135,
    steps: [
      { instruction: "Rinse filter. Add 16g of coarse ground coffee." },
      { at: 0, instruction: "Pour 240g of water at 80C and stir." },
      { at: 90, instruction: "Insert plunger." },
      { at: 110, instruction: "Press slowly." },
      { at: 135, instruction: "Done." },
    ],
  },
  {
    id: "travel-concentrate",
    name: "Travel Concentrate",
    author: "AeroPress classic",
    blurb: "A strong concentrate to dilute wherever you are.",
    roast: "medium",
    grind: "fine",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 22,
    waterGrams: 120,
    waterTempC: 90,
    c40Clicks: 16,
    totalSeconds: 110,
    steps: [
      { instruction: "Assemble inverted. Add 22g of fine ground coffee." },
      { at: 0, instruction: "Pour 120g of water and stir well." },
      { at: 60, instruction: "Cap and flip onto the cup." },
      { at: 80, instruction: "Press over 30 seconds." },
      { at: 110, instruction: "Dilute 1:2 with hot water." },
    ],
  },
  {
    id: "tea-like",
    name: "Tea-Like Light",
    author: "Nordic style",
    blurb: "Coarse grind and gentle press for a clean, delicate cup.",
    roast: "light",
    grind: "coarse",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 13,
    waterGrams: 220,
    waterTempC: 92,
    c40Clicks: 33,
    totalSeconds: 150,
    steps: [
      { instruction: "Rinse filter. Add 13g of coarse ground coffee." },
      { at: 0, instruction: "Pour 220g of water and stir once." },
      { at: 110, instruction: "Swirl gently." },
      { at: 120, instruction: "Press very slowly over 30 seconds." },
      { at: 150, instruction: "Finish." },
    ],
  },
  {
    id: "creamy-medium",
    name: "Creamy Medium",
    author: "Barista pick",
    blurb: "Fine grind and a longer steep for a rounded, creamy body.",
    roast: "medium",
    grind: "fine",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 17,
    waterGrams: 230,
    waterTempC: 91,
    c40Clicks: 17,
    totalSeconds: 210,
    steps: [
      { instruction: "Assemble inverted. Add 17g of fine ground coffee." },
      { at: 0, instruction: "Pour 230g of water and stir 3 times." },
      { at: 180, instruction: "Cap and flip onto the cup." },
      { at: 195, instruction: "Press over 15 seconds." },
      { at: 210, instruction: "Finish." },
    ],
  },
  {
    id: "punchy-dark",
    name: "Punchy Dark",
    author: "AeroPress classic",
    blurb: "Quick, strong and bold for a morning kick.",
    roast: "dark",
    grind: "fine",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 18,
    waterGrams: 180,
    waterTempC: 86,
    c40Clicks: 14,
    totalSeconds: 90,
    steps: [
      { instruction: "Rinse filter. Add 18g of fine ground coffee." },
      { at: 0, instruction: "Pour 180g of water and stir." },
      { at: 30, instruction: "Insert plunger." },
      { at: 60, instruction: "Press over 30 seconds." },
      { at: 90, instruction: "Done." },
    ],
  },
  {
    id: "balanced-coarse",
    name: "Balanced Coarse",
    author: "Everyday brew",
    blurb: "Coarse grind, longer steep, easy to dial in.",
    roast: "medium",
    grind: "coarse",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 16,
    waterGrams: 250,
    waterTempC: 92,
    c40Clicks: 30,
    totalSeconds: 195,
    steps: [
      { instruction: "Rinse filter. Add 16g of coarse ground coffee." },
      { at: 0, instruction: "Pour 250g of water and stir twice." },
      { at: 165, instruction: "Swirl gently." },
      { at: 180, instruction: "Press over 15 seconds." },
      { at: 195, instruction: "Finish." },
    ],
  },
  {
    id: "ristretto-punch",
    name: "Ristretto Punch",
    author: "AeroPress classic",
    blurb: "Tiny, syrupy shot for dark roasts when you want intensity.",
    roast: "dark",
    grind: "fine",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 19,
    waterGrams: 50,
    waterTempC: 87,
    c40Clicks: 11,
    totalSeconds: 75,
    steps: [
      { instruction: "Assemble inverted. Add 19g of fine ground coffee." },
      { at: 0, instruction: "Pour 50g of water and stir quickly." },
      { at: 30, instruction: "Cap and flip onto the cup." },
      { at: 45, instruction: "Press firmly over 30 seconds." },
      { at: 75, instruction: "Top with hot water or steamed milk." },
    ],
  },
  {
    id: "floral-light",
    name: "Floral Filter",
    author: "Third wave",
    blurb: "Light pour-over style cup that keeps florals delicate and clean.",
    roast: "light",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 13,
    waterGrams: 210,
    waterTempC: 93,
    c40Clicks: 27,
    totalSeconds: 165,
    steps: [
      { instruction: "Rinse filter. Add 13g of medium ground coffee." },
      { at: 0, instruction: "Add 40g of water to bloom and stir." },
      { at: 30, instruction: "Pour remaining water up to 210g." },
      { at: 130, instruction: "Swirl, then insert plunger." },
      { at: 140, instruction: "Press slowly over 25 seconds." },
      { at: 165, instruction: "Finish." },
    ],
  },
  {
    id: "choc-medium",
    name: "Chocolate Comfort",
    author: "Barista pick",
    blurb: "Rounded, cocoa-forward cup for comfortable medium roasts.",
    roast: "medium",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 16,
    waterGrams: 230,
    waterTempC: 90,
    c40Clicks: 23,
    totalSeconds: 150,
    steps: [
      { instruction: "Rinse filter. Add 16g of medium ground coffee." },
      { at: 0, instruction: "Pour 230g of water and stir twice." },
      { at: 60, instruction: "Insert plunger and steep." },
      { at: 130, instruction: "Press over 20 seconds." },
      { at: 150, instruction: "Done." },
    ],
  },
  {
    id: "iced-aeropress",
    name: "Iced AeroPress",
    author: "AeroPress classic",
    blurb: "Strong concentrate pressed straight onto ice for a crisp iced cup.",
    roast: "medium",
    grind: "fine",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 18,
    waterGrams: 120,
    waterTempC: 92,
    c40Clicks: 17,
    totalSeconds: 105,
    steps: [
      { instruction: "Fill your cup with ice. Assemble inverted." },
      {
        at: 0,
        instruction: "Add 18g of fine coffee, pour 120g of water, stir.",
      },
      { at: 45, instruction: "Cap and flip onto the iced cup." },
      { at: 75, instruction: "Press over 30 seconds." },
      { at: 105, instruction: "Stir and top with cold water to taste." },
    ],
  },
  {
    id: "decaf-easy",
    name: "Easy Decaf",
    author: "Everyday brew",
    blurb: "Forgiving recipe that keeps decaf sweet and free of harshness.",
    roast: "medium",
    grind: "coarse",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 17,
    waterGrams: 240,
    waterTempC: 89,
    c40Clicks: 29,
    totalSeconds: 180,
    steps: [
      { instruction: "Rinse filter. Add 17g of coarse ground coffee." },
      { at: 0, instruction: "Pour 240g of water and stir twice." },
      { at: 150, instruction: "Swirl gently." },
      { at: 165, instruction: "Press over 15 seconds." },
      { at: 180, instruction: "Finish." },
    ],
  },
  {
    id: "competition-sweet",
    name: "Sweet Competition",
    author: "Competition style",
    blurb:
      "Long, gentle extraction that chases maximum sweetness in light roasts.",
    roast: "light",
    grind: "fine",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 16,
    waterGrams: 240,
    waterTempC: 94,
    c40Clicks: 16,
    totalSeconds: 320,
    steps: [
      { instruction: "Assemble inverted. Add 16g of fine ground coffee." },
      { at: 0, instruction: "Pour 240g of water at 94C and stir 4 times." },
      { at: 90, instruction: "Stir once more." },
      { at: 290, instruction: "Cap and flip onto the cup." },
      { at: 305, instruction: "Press slowly over 15 seconds." },
      { at: 320, instruction: "Finish." },
    ],
  },
  {
    id: "hoffmann-v60-ultimate",
    name: "Hoffmann's Ultimate V60",
    author: "James Hoffmann",
    blurb:
      "His classic 500ml V60: a high dose, a quick bloom and a gentle two-stage pour for a sweet, even cup.",
    notes:
      "Hoffmann brews light roasts with water straight off the boil. Use a medium-fine grind and aim to finish the pours by 1:45.",
    roast: "light",
    grind: "medium",
    method: "v60",
    coffeeGrams: 30,
    waterGrams: 500,
    waterTempC: 100,
    c40Clicks: 24,
    totalSeconds: 210,
    steps: [
      { instruction: "Rinse the paper filter with hot water and discard it." },
      { instruction: "Add 30g of coffee and make a small well in the centre." },
      {
        at: 0,
        instruction: "Pour 60g to bloom, then swirl to wet all grounds.",
      },
      {
        at: 45,
        instruction: "Pour steadily up to 300g, finishing by 1:15.",
      },
      { at: 75, instruction: "Pour up to 500g total, finishing by 1:45." },
      { at: 105, instruction: "Gently swirl the slurry to flatten the bed." },
      { at: 210, instruction: "Let it draw down completely, then serve." },
    ],
  },
  {
    id: "kasuya-46-method",
    name: "Tetsu Kasuya 4:6 Method",
    author: "Tetsu Kasuya",
    blurb:
      "The World Brewers Cup method. The first 40% of water dials in sweetness and acidity; the last 60% sets the strength.",
    notes:
      "Tetsu brews lighter roasts hotter and darker roasts cooler. Five even 60g pours is the neutral baseline; pouring less first (50g, then 70g) leans sweeter, more first leans brighter.",
    roast: "light",
    grind: "coarse",
    method: "v60",
    coffeeGrams: 20,
    waterGrams: 300,
    waterTempC: 92,
    c40Clicks: 30,
    totalSeconds: 210,
    steps: [
      {
        instruction: "Rinse the filter and add 20g of coarsely ground coffee.",
      },
      { at: 0, instruction: "Pour 60g and let it bloom." },
      { at: 45, instruction: "Pour to 120g total to set the sweetness." },
      { at: 90, instruction: "Pour to 180g total." },
      { at: 135, instruction: "Pour to 240g total." },
      { at: 180, instruction: "Pour to 300g total to set the strength." },
      { at: 210, instruction: "Let it drain fully and serve." },
    ],
  },
  {
    id: "onyx-v60",
    name: "Onyx Classic V60",
    author: "Onyx Coffee Lab",
    blurb:
      "Onyx's cafe brew guide: a hot, medium-fine single cup with a bloom and two even pours.",
    notes:
      "Onyx brews hot — around 99C — with a medium-fine grind for maximum sweetness and clarity.",
    roast: "medium",
    grind: "medium",
    method: "v60",
    coffeeGrams: 15,
    waterGrams: 250,
    waterTempC: 99,
    c40Clicks: 22,
    totalSeconds: 180,
    steps: [
      { instruction: "Rinse the filter and add 15g of medium-fine coffee." },
      { at: 0, instruction: "Pour 50g to bloom and stir gently." },
      { at: 45, instruction: "Pour to 150g total in slow circles." },
      { at: 90, instruction: "Pour to 250g total." },
      { at: 180, instruction: "Let the bed draw down and serve." },
    ],
  },
  {
    id: "hedrick-beginner-pour-over",
    name: "Beginner Pour Over",
    author: "Lance Hedrick style",
    blurb:
      "A forgiving, high-agitation single pour that is hard to get wrong and easy to dial in.",
    roast: "medium",
    grind: "medium",
    method: "v60",
    coffeeGrams: 15,
    waterGrams: 250,
    waterTempC: 99,
    c40Clicks: 22,
    totalSeconds: 195,
    steps: [
      { instruction: "Rinse the filter and add 15g of coffee." },
      { at: 0, instruction: "Pour 50g to bloom and swirl hard to saturate." },
      { at: 45, instruction: "Pour in a steady stream to 250g total." },
      { at: 75, instruction: "Swirl gently to settle the bed." },
      { at: 195, instruction: "Let it draw down fully and serve." },
    ],
  },
  {
    id: "wendelboe-v60",
    name: "Nordic Pour Over",
    author: "Nordic style",
    blurb: "A clean, tea-like pour-over for delicate Nordic light roasts.",
    roast: "light",
    grind: "medium",
    method: "v60",
    coffeeGrams: 15,
    waterGrams: 250,
    waterTempC: 96,
    c40Clicks: 26,
    totalSeconds: 180,
    steps: [
      { instruction: "Rinse the filter and add 15g of medium ground coffee." },
      { at: 0, instruction: "Pour 40g to bloom for 30 seconds." },
      { at: 30, instruction: "Pour slowly to 150g total." },
      { at: 75, instruction: "Pour to 250g total." },
      { at: 180, instruction: "Let it finish dripping and serve." },
    ],
  },
  {
    id: "april-simple-v60",
    name: "April Six-Pour V60",
    author: "April Coffee",
    blurb:
      "April's official recipe: six even 50g pours, poured with intention to agitate, for a clean, balanced cup.",
    notes:
      "Pour each 50g with some energy — the agitation is deliberate. Use a coarse grind so the bed still drains freely.",
    roast: "light",
    grind: "coarse",
    method: "v60",
    coffeeGrams: 20,
    waterGrams: 300,
    waterTempC: 92,
    c40Clicks: 30,
    totalSeconds: 210,
    steps: [
      {
        instruction: "Rinse the filter and add 20g of coarsely ground coffee.",
      },
      { at: 0, instruction: "Pour 50g to wet the grounds." },
      { at: 40, instruction: "Pour to 100g total." },
      { at: 70, instruction: "Pour to 150g total." },
      { at: 100, instruction: "Pour to 200g total." },
      { at: 130, instruction: "Pour to 250g total." },
      { at: 160, instruction: "Pour to 300g total." },
      { at: 210, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "scott-rao-v60",
    name: "Scott Rao V60",
    author: "Scott Rao",
    blurb:
      "A single continuous pour after the bloom, finished with a gentle spin for an even, flat bed.",
    roast: "medium",
    grind: "medium",
    method: "v60",
    coffeeGrams: 22,
    waterGrams: 360,
    waterTempC: 96,
    c40Clicks: 24,
    totalSeconds: 225,
    steps: [
      { instruction: "Rinse the filter and add 22g of coffee." },
      { at: 0, instruction: "Pour 60g to bloom and stir to saturate." },
      { at: 45, instruction: "Pour in one steady stream up to 360g total." },
      {
        at: 90,
        instruction: "Give the slurry a gentle spin to flatten the bed.",
      },
      { at: 225, instruction: "Let it draw down fully and serve." },
    ],
  },
  {
    id: "matt-winton-v60",
    name: "Matt Winton Competition V60",
    author: "Matt Winton",
    blurb:
      "A five-pour championship recipe: equal 60g pours every 30 seconds for a clean, sweet, repeatable cup.",
    notes:
      "Winton waits about 30 seconds between pours, or until the bed just runs dry. Expect a slow final drawdown.",
    roast: "light",
    grind: "medium",
    method: "v60",
    coffeeGrams: 20,
    waterGrams: 300,
    waterTempC: 93,
    c40Clicks: 26,
    totalSeconds: 210,
    steps: [
      { instruction: "Rinse the filter and add 20g of coffee." },
      { at: 0, instruction: "Pour to 60g and let it bloom." },
      { at: 30, instruction: "Pour to 120g total." },
      { at: 60, instruction: "Pour to 180g total." },
      { at: 90, instruction: "Pour to 240g total." },
      { at: 120, instruction: "Pour to 300g total." },
      { at: 210, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "kurasu-kyoto-v60",
    name: "Kurasu Kyoto V60",
    author: "Kurasu",
    blurb:
      "The Kyoto cafe's single-cup recipe: a small seed-hole bloom and two gentle pours.",
    notes:
      "Make a small well in the centre of the grounds before blooming so the water saturates evenly.",
    roast: "light",
    grind: "medium",
    method: "v60",
    coffeeGrams: 12,
    waterGrams: 200,
    waterTempC: 92,
    c40Clicks: 24,
    totalSeconds: 120,
    steps: [
      {
        instruction:
          "Rinse the filter, add 12g of coffee and make a small well in the centre.",
      },
      { at: 0, instruction: "Pour 25g into the well to bloom." },
      { at: 30, instruction: "Pour to 110g total in slow circles." },
      { at: 60, instruction: "Pour to 200g total." },
      { at: 120, instruction: "Let it finish dripping and serve." },
    ],
  },
  {
    id: "wendelboe-pourover",
    name: "Tim Wendelboe Pour Over",
    author: "Tim Wendelboe",
    blurb:
      "His cafe standard at 65g per litre: a stirred bloom, a big wetting pour and one slow circular fill.",
    notes:
      "Published dose is 32.5g (65g per litre) — rounded to 32g here. If the drawdown takes much longer than a minute, grind coarser; if it races through, grind finer. Stir the brew before serving.",
    roast: "light",
    grind: "medium",
    method: "v60",
    coffeeGrams: 32,
    waterGrams: 500,
    waterTempC: 96,
    c40Clicks: 26,
    totalSeconds: 195,
    steps: [
      {
        instruction:
          "Rinse the filter, add 32g of coffee and shake the bed level.",
      },
      { at: 0, instruction: "Pour 60g to bloom and stir with a teaspoon." },
      {
        at: 30,
        instruction: "Pour to 200g total, wetting all the grounds.",
      },
      {
        at: 60,
        instruction:
          "Pour in slow circles up to 500g total, finishing by 2:15.",
      },
      {
        at: 195,
        instruction: "Let it finish dripping, stir the brew and serve.",
      },
    ],
  },
  {
    id: "kezo-v60",
    name: "Kezo V60",
    author: "Kezo",
    blurb:
      "The house recipe: a long bloom, a rested first pour and a steady finish.",
    roast: "light",
    grind: "medium",
    method: "v60",
    coffeeGrams: 15,
    waterGrams: 250,
    waterTempC: 94,
    c40Clicks: 24,
    totalSeconds: 135,
    steps: [
      { instruction: "Rinse the filter and add 15g of coffee." },
      { at: 0, instruction: "Pour 50g to bloom." },
      { at: 45, instruction: "Pour to 150g total, then wait 10 seconds." },
      { at: 65, instruction: "Pour to 250g total." },
      { at: 135, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "hoffmann-two-cup-v60",
    name: "Hoffmann Two-Cup V60",
    author: "James Hoffmann",
    blurb:
      "The Ultimate technique scaled to two cups, with a larger bloom and two even pours.",
    roast: "medium",
    grind: "medium",
    method: "v60",
    coffeeGrams: 36,
    waterGrams: 600,
    waterTempC: 96,
    c40Clicks: 28,
    totalSeconds: 240,
    steps: [
      {
        instruction:
          "Rinse the filter and add 36g of coffee, then make a well.",
      },
      {
        at: 0,
        instruction: "Pour 72g to bloom, then swirl to wet all grounds.",
      },
      { at: 45, instruction: "Pour steadily up to 360g, finishing by 1:15." },
      {
        at: 75,
        instruction: "Pour gently up to 600g total, finishing by 1:45.",
      },
      { at: 105, instruction: "Gently swirl the slurry to flatten the bed." },
      { at: 240, instruction: "Let it draw down completely, then serve." },
    ],
  },
  {
    id: "orea-base-one",
    name: "Base ONE",
    author: "Orea",
    blurb:
      "Orea's official starting point for the O1: four even spiral pours for a bright, light-bodied cup.",
    notes:
      "Use the Orea Wave filter. Pour each time the water nearly reaches the bed. Expect big brightness and a lighter body.",
    roast: "light",
    grind: "medium",
    method: "orea-o1",
    coffeeGrams: 12,
    waterGrams: 200,
    waterTempC: 96,
    c40Clicks: 22,
    totalSeconds: 135,
    steps: [
      { instruction: "Rinse the filter and add 12g of coffee." },
      { at: 0, instruction: "Spiral pour to 50g." },
      { at: 40, instruction: "Pour to 100g total." },
      { at: 70, instruction: "Pour to 150g total." },
      { at: 100, instruction: "Pour to 200g total." },
      { at: 135, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-mid",
    name: "The MID",
    author: "Orea",
    blurb:
      "Orea's balanced O1 recipe: a bloom and two slow pours, tuned by pour speed.",
    notes:
      "Use a flat Orea paper with the Negotiator. Pour half circular, half into the centre — slow the pour for more extraction.",
    roast: "medium",
    grind: "medium",
    method: "orea-o1",
    coffeeGrams: 12,
    waterGrams: 200,
    waterTempC: 92,
    c40Clicks: 22,
    totalSeconds: 180,
    steps: [
      { instruction: "Rinse the filter and add 12g of coffee." },
      { at: 0, instruction: "Spiral pour to 50g." },
      {
        at: 40,
        instruction: "Pour to 125g total, half circular and half centre.",
      },
      { at: 105, instruction: "Pour to 200g total the same way." },
      { at: 180, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-easy-does-it-o1",
    name: "Easy Does It",
    author: "Orea",
    blurb:
      "Five gentle 50g pulses on the O1 — forgiving and repeatable for any roast.",
    notes:
      "Flat Orea paper with the Negotiator. Grind a little finer if you brew with Wave filters instead.",
    roast: "medium",
    grind: "medium",
    method: "orea-o1",
    coffeeGrams: 16,
    waterGrams: 260,
    waterTempC: 94,
    c40Clicks: 26,
    totalSeconds: 190,
    steps: [
      { instruction: "Rinse the filter and add 16g of coffee." },
      { at: 0, instruction: "Gentle spiral pour to 60g." },
      { at: 40, instruction: "Pour to 110g total." },
      { at: 70, instruction: "Pour to 160g total." },
      { at: 100, instruction: "Pour to 210g total." },
      { at: 130, instruction: "Pour to 260g total." },
      { at: 190, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-bypass",
    name: "The BYPASS",
    author: "Matteo D'Ottavio",
    blurb:
      "The UK Brewers Cup champion's O1 recipe: three pours, then dial in strength with bypass water.",
    notes:
      "Use the Orea Wave filter and pour circular-to-centre at about 4g per second. After drawdown, add 15-30g of hot water to the cup, tasting as you go.",
    roast: "medium",
    grind: "medium",
    method: "orea-o1",
    coffeeGrams: 18,
    waterGrams: 260,
    waterTempC: 96,
    c40Clicks: 22,
    totalSeconds: 180,
    steps: [
      { instruction: "Rinse the filter and add 18g of coffee." },
      { at: 0, instruction: "Pour to 60g, circular then into the centre." },
      { at: 40, instruction: "Pour to 160g total at about 4g per second." },
      { at: 90, instruction: "Pour to 260g total the same way." },
      {
        at: 180,
        instruction: "After drawdown, add 15-30g hot water to taste.",
      },
    ],
  },
  {
    id: "orea-dara-o1",
    name: "The Dara",
    author: "Dara (Madrid)",
    blurb: "A gentle four-pour O1 recipe from Orea's guides.",
    notes: "Use the Orea Wave filter and pour in slow spirals.",
    roast: "medium",
    grind: "medium",
    method: "orea-o1",
    coffeeGrams: 12,
    waterGrams: 200,
    waterTempC: 94,
    c40Clicks: 22,
    totalSeconds: 165,
    steps: [
      { instruction: "Rinse the filter and add 12g of coffee." },
      { at: 0, instruction: "Spiral pour to 40g." },
      { at: 40, instruction: "Pour to 90g total." },
      { at: 80, instruction: "Pour to 150g total." },
      { at: 120, instruction: "Pour to 200g total." },
      { at: 165, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-wide",
    name: "The Wide",
    author: "Orea",
    blurb:
      "A low-dose, fine-grind O1 recipe with long waits for a slow, deep extraction.",
    notes:
      "Flat Orea paper with the Negotiator. Pour half circular, half into the centre. Expect a long drawdown.",
    roast: "light",
    grind: "fine",
    method: "orea-o1",
    coffeeGrams: 10,
    waterGrams: 200,
    waterTempC: 96,
    c40Clicks: 16,
    totalSeconds: 240,
    steps: [
      { instruction: "Rinse the filter and add 10g of coffee." },
      { at: 0, instruction: "Spiral pour to 50g." },
      {
        at: 60,
        instruction: "Pour to 125g total, half circular and half centre.",
      },
      { at: 120, instruction: "Pour to 200g total the same way." },
      { at: 240, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-fine-o1",
    name: "The Fine",
    author: "Orea",
    blurb:
      "A community favourite: one continuous fine-grind pour, done in two minutes.",
    notes:
      "Use the Orea Wave filter. One single pour: start in circles, finish into the centre.",
    roast: "light",
    grind: "fine",
    method: "orea-o1",
    coffeeGrams: 12,
    waterGrams: 200,
    waterTempC: 94,
    c40Clicks: 17,
    totalSeconds: 120,
    steps: [
      { instruction: "Rinse the filter and add 12g of coffee." },
      {
        at: 0,
        instruction:
          "Pour 50g in circles, then the remaining 150g into the centre, to 200g total.",
      },
      { at: 120, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-techno",
    name: "The Techno",
    author: "Mordy (Berlin)",
    blurb:
      "A four-pour O1 recipe that shifts from circular to central pours as it goes.",
    notes:
      "Flat Orea paper with the Negotiator. The third pour splits 20g circular, 20g central; the last goes straight to the centre.",
    roast: "medium",
    grind: "medium",
    method: "orea-o1",
    coffeeGrams: 12,
    waterGrams: 200,
    waterTempC: 94,
    c40Clicks: 24,
    totalSeconds: 165,
    steps: [
      { instruction: "Rinse the filter and add 12g of coffee." },
      { at: 0, instruction: "Circular pour to 40g." },
      { at: 30, instruction: "Circular pour to 120g total." },
      {
        at: 80,
        instruction: "Pour to 160g total: 20g circular, then 20g central.",
      },
      { at: 105, instruction: "Central pour to 200g total." },
      { at: 165, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-ice",
    name: "The Ice",
    author: "Orea",
    blurb:
      "Orea's official flash brew: concentrated hot pours straight onto a carafe of ice.",
    notes:
      "Use the Orea Wave filter. The 140g of ice in the carafe melts into the brew to complete the ratio.",
    roast: "light",
    grind: "medium",
    method: "orea-o1",
    coffeeGrams: 18,
    waterGrams: 160,
    waterTempC: 94,
    c40Clicks: 23,
    totalSeconds: 120,
    steps: [
      {
        instruction:
          "Add 140g of ice to the carafe. Rinse the filter and add 18g of coffee.",
      },
      { at: 0, instruction: "Gentle spiral pour to 40g." },
      { at: 40, instruction: "Pour to 80g total." },
      { at: 60, instruction: "Pour to 120g total." },
      { at: 80, instruction: "Pour to 160g total." },
      { at: 120, instruction: "Let it draw down, swirl the carafe and serve." },
    ],
  },
  {
    id: "orea-the-bright",
    name: "The Bright",
    author: "Orea",
    blurb:
      "A bigger, faster O1 brew: three quick circular pours for a bright 300g cup.",
    notes: "Use the Orea Wave filter and keep the pours moving.",
    roast: "light",
    grind: "medium",
    method: "orea-o1",
    coffeeGrams: 18,
    waterGrams: 300,
    waterTempC: 94,
    c40Clicks: 22,
    totalSeconds: 150,
    steps: [
      { instruction: "Rinse the filter and add 18g of coffee." },
      { at: 0, instruction: "Circular pour to 75g." },
      { at: 30, instruction: "Pour to 150g total." },
      { at: 60, instruction: "Pour to 300g total." },
      { at: 150, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-easy-does-it-z1",
    name: "Easy Does It Z1",
    author: "Orea",
    blurb: "Orea's five-pulse recipe adapted for the zero-bypass Z1.",
    notes:
      "Paper filter with the MeloDrip. For dense washed coffees combine the last two pours into one 100g pour; for fermented coffees go 2 clicks coarser or raise the dose to 18g.",
    roast: "medium",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 16,
    waterGrams: 260,
    waterTempC: 96,
    c40Clicks: 24,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 16g of coffee.",
      },
      { at: 0, instruction: "Spiral pour to 60g." },
      { at: 40, instruction: "Pour to 110g total." },
      { at: 75, instruction: "Pour to 160g total." },
      { at: 105, instruction: "Pour to 210g total." },
      { at: 135, instruction: "Pour to 260g total." },
      { at: 165, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-ray",
    name: "The RAY",
    author: "Ray Murakawa",
    blurb:
      "The MeloDrip inventor's Z1 recipe: drained pulses for a juicy, silky, higher-strength cup.",
    notes:
      "Pour through the MeloDrip. Let the water drain to about 1cm above the bed before the third and final pours. Medium roasts finish nearer 2:30.",
    roast: "light",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 15,
    waterGrams: 255,
    waterTempC: 92,
    c40Clicks: 20,
    totalSeconds: 195,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 15g of coffee.",
      },
      { at: 0, instruction: "Spiral pour to 40g." },
      {
        at: 40,
        instruction:
          "Pour to 100g total, then let it drain to 1cm above the bed.",
      },
      { at: 75, instruction: "Pour to 160g total and let it drain again." },
      { at: 120, instruction: "Pour to 255g total." },
      { at: 195, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-amulet-z1",
    name: "Amulet's Z1",
    author: "Matt Cowie",
    blurb:
      "The Glasgow cafe's service recipe: two fast pours then two slow ones for bright, dynamic coffees.",
    notes:
      "Paper filter with the MeloDrip. The first two pours are deliberately fast; the last two slow and circular.",
    roast: "light",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 15,
    waterGrams: 240,
    waterTempC: 92,
    c40Clicks: 22,
    totalSeconds: 150,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 15g of coffee.",
      },
      { at: 0, instruction: "Pour very fast to 60g." },
      { at: 40, instruction: "Pour even faster to 140g total." },
      { at: 75, instruction: "Pour slowly in circles to 190g total." },
      { at: 105, instruction: "Pour slowly to 240g total." },
      { at: 150, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "hedrick-z1",
    name: "Lance Hedrick's Z1",
    author: "Lance Hedrick",
    blurb:
      "A coarse, drain-controlled Z1 recipe from his review: double bloom, two big pours.",
    notes:
      "Grind super coarse and pour through the MeloDrip. Let the bed fully drain before each big pour, and spin the brewer if saturation looks uneven — a slow drawdown adds bitterness.",
    roast: "light",
    grind: "coarse",
    method: "orea-z1",
    coffeeGrams: 20,
    waterGrams: 340,
    waterTempC: 93,
    c40Clicks: 30,
    totalSeconds: 210,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 20g of coffee.",
      },
      { at: 0, instruction: "Pour a 60g bloom in small circles." },
      { at: 10, instruction: "Spin the brewer to even out saturation." },
      { at: 30, instruction: "Pour a second 60g bloom to 120g total." },
      {
        at: 60,
        instruction: "Pour to 230g total, then let the bed drain fully.",
      },
      { at: 110, instruction: "Pour to 340g total." },
      { at: 210, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-champ",
    name: "The CHAMP",
    author: "Martin Wölfl",
    blurb: "The 2024 World Brewers Cup recipe, ported to the Z1 by Orea.",
    notes:
      "Originally written for the Orea V4; Orea adapted it to the Z1 with the MeloDrip.",
    roast: "light",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 17,
    waterGrams: 270,
    waterTempC: 93,
    c40Clicks: 22,
    totalSeconds: 195,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 17g of coffee.",
      },
      { at: 0, instruction: "Pour to 60g." },
      { at: 40, instruction: "Pour to 120g total." },
      { at: 85, instruction: "Pour to 170g total." },
      { at: 135, instruction: "Pour to 270g total." },
      { at: 195, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-quan-picolot",
    name: "Brian Quan's Picolot",
    author: "Brian Quan",
    blurb:
      "Two max-speed pours, then a slow column-fed finish that adapts to the coffee.",
    notes:
      "Paper filter with the MeloDrip. For the final pour keep a small water column above the bed, pouring at about 2-3 g/s.",
    roast: "light",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 15,
    waterGrams: 250,
    waterTempC: 95,
    c40Clicks: 22,
    totalSeconds: 180,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 15g of coffee.",
      },
      { at: 0, instruction: "Pour to 60g as fast as you can." },
      { at: 60, instruction: "Fast pour to 160g total." },
      {
        at: 105,
        instruction:
          "When the bed almost drains, pour slowly to 250g total, keeping a small column of water.",
      },
      { at: 180, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-lazy-sunday",
    name: "Lazy Sunday",
    author: "Orea",
    blurb: "Orea's easy-going three-pour Z1 recipe.",
    notes: "Paper filter with the MeloDrip. Slow, relaxed spiral pours.",
    roast: "medium",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 15,
    waterGrams: 250,
    waterTempC: 96,
    c40Clicks: 22,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 15g of coffee.",
      },
      { at: 0, instruction: "Spiral pour to 50g." },
      { at: 40, instruction: "Pour to 150g total." },
      { at: 105, instruction: "Pour to 250g total." },
      { at: 165, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-dara-z1",
    name: "The Dara Z1",
    author: "Dara (Madrid)",
    blurb: "The Madrid four-pour recipe, brewed zero-bypass on the Z1.",
    notes: "Paper filter with the MeloDrip.",
    roast: "medium",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 12,
    waterGrams: 200,
    waterTempC: 94,
    c40Clicks: 22,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 12g of coffee.",
      },
      { at: 0, instruction: "Spiral pour to 40g." },
      { at: 40, instruction: "Pour to 90g total." },
      { at: 80, instruction: "Pour to 150g total." },
      { at: 120, instruction: "Pour to 200g total." },
      { at: 165, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-dara-a",
    name: "The Dara(A)",
    author: "Dara (Madrid)",
    blurb: "Dara's bigger, cooler Z1 variant with four pours.",
    notes: "Paper filter with the MeloDrip.",
    roast: "medium",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 15,
    waterGrams: 250,
    waterTempC: 92,
    c40Clicks: 22,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 15g of coffee.",
      },
      { at: 0, instruction: "Spiral pour to 50g." },
      { at: 40, instruction: "Pour to 150g total." },
      { at: 90, instruction: "Pour to 200g total." },
      { at: 120, instruction: "Pour to 250g total." },
      { at: 165, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-aussie",
    name: "The Aussie",
    author: "Orea",
    blurb:
      "Hot and coarse, inspired by Australian Brewers Cup competitors: five even pours at 97C.",
    notes: "Paper filter with the MeloDrip.",
    roast: "light",
    grind: "coarse",
    method: "orea-z1",
    coffeeGrams: 17,
    waterGrams: 250,
    waterTempC: 97,
    c40Clicks: 28,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 17g of coffee.",
      },
      { at: 0, instruction: "Spiral pour to 50g." },
      { at: 40, instruction: "Pour to 100g total." },
      { at: 70, instruction: "Pour to 150g total." },
      { at: 100, instruction: "Pour to 200g total." },
      { at: 130, instruction: "Pour to 250g total." },
      { at: 165, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-hybrid",
    name: "The Hybrid",
    author: "Matteo D'Ottavio",
    blurb:
      "Percolation and immersion in one brew, using the Z1's Switch valve.",
    notes:
      "Needs the Switch adapter and the MeloDrip. The valve closes for the bloom and final steep, opens in between.",
    roast: "medium",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 16,
    waterGrams: 260,
    waterTempC: 94,
    c40Clicks: 26,
    totalSeconds: 210,
    steps: [
      {
        instruction:
          "Fit the Switch adapter and MeloDrip, rinse the filter and add 16g of coffee. Close the valve.",
      },
      { at: 0, instruction: "Spiral pour to 60g with the valve closed." },
      { at: 40, instruction: "Open the valve and pour to 160g total." },
      { at: 100, instruction: "Close the valve and pour to 260g total." },
      { at: 180, instruction: "Open the valve and let it drain." },
      { at: 210, instruction: "Serve." },
    ],
  },
  {
    id: "orea-the-micro",
    name: "The Micro",
    author: "Orea",
    blurb: "A tiny 10g valve brew — no filter tricks, just the Switch.",
    notes:
      "Needs the Switch adapter; no MeloDrip. Pour the main fill slowly, about 3 g/s.",
    roast: "medium",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 10,
    waterGrams: 170,
    waterTempC: 95,
    c40Clicks: 22,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Fit the Switch adapter, rinse the filter and add 10g of coffee.",
      },
      { at: 0, instruction: "With the valve open, spiral pour to 20g." },
      {
        at: 40,
        instruction:
          "Close the valve and pour slowly to 170g total, about 3 g/s.",
      },
      { at: 120, instruction: "Open the valve and let it drain." },
      { at: 165, instruction: "Serve." },
    ],
  },
  {
    id: "orea-the-scandi",
    name: "The Scandi",
    author: "Orea",
    blurb: "Two big, fast pours — a Nordic-style light-roast brew on the Z1.",
    notes:
      "Paper filter with the MeloDrip. Finish each 100g pour within 20 seconds.",
    roast: "light",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 12,
    waterGrams: 200,
    waterTempC: 93,
    c40Clicks: 22,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 12g of coffee.",
      },
      { at: 0, instruction: "Circular pour to 100g within 20 seconds." },
      { at: 75, instruction: "Circular pour to 200g total within 20 seconds." },
      { at: 165, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-four-six-z1",
    name: "The Four Six",
    author: "Tetsu Kasuya",
    blurb: "Kasuya's 4:6 structure adapted by Orea for the Z1.",
    notes:
      "Paper filter with the MeloDrip. The first two pours set sweetness, the last three set strength.",
    roast: "medium",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 14,
    waterGrams: 225,
    waterTempC: 94,
    c40Clicks: 24,
    totalSeconds: 180,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 14g of coffee.",
      },
      { at: 0, instruction: "Circular pour to 35g." },
      { at: 40, instruction: "Pour to 90g total." },
      { at: 80, instruction: "Pour to 135g total." },
      { at: 105, instruction: "Pour to 180g total." },
      { at: 125, instruction: "Pour to 225g total." },
      { at: 180, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-clever",
    name: "The Clever",
    author: "Orea",
    blurb:
      "A full-immersion Z1 brew based on James Hoffmann's Clever recipe: water first, then coffee.",
    notes:
      "Needs the Switch adapter; no MeloDrip. Adding water before coffee keeps the bed from channeling.",
    roast: "medium",
    grind: "fine",
    method: "orea-z1",
    coffeeGrams: 10,
    waterGrams: 166,
    waterTempC: 92,
    c40Clicks: 18,
    totalSeconds: 195,
    steps: [
      {
        instruction:
          "Fit the Switch adapter and close the valve. Add all 166g of water first.",
      },
      {
        at: 0,
        instruction: "Add 10g of coffee and mix gently with a spoon.",
      },
      { at: 120, instruction: "Open the valve and let it drain." },
      { at: 195, instruction: "Serve." },
    ],
  },
  {
    id: "orea-the-cleverer",
    name: "The Clever(er)",
    author: "Orea",
    blurb: "A stronger, smaller take on the Clever-style immersion brew.",
    notes: "Needs the Switch adapter; no MeloDrip.",
    roast: "medium",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 12,
    waterGrams: 150,
    waterTempC: 94,
    c40Clicks: 22,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Fit the Switch adapter and close the valve. Add all 150g of water first.",
      },
      {
        at: 0,
        instruction: "Add 12g of coffee and mix gently with a spoon.",
      },
      { at: 120, instruction: "Open the valve and let it drain." },
      { at: 165, instruction: "Serve." },
    ],
  },
  {
    id: "orea-aero-jibbi",
    name: "The Aero Jibbi",
    author: "Jibbi Little",
    blurb:
      "An AeroPress-style concentrate on the Z1 from the Australian champion, finished with bypass water.",
    notes:
      "Needs the Switch adapter; no MeloDrip. After draining, add 50-75g of bypass water at the same temperature to taste.",
    roast: "light",
    grind: "coarse",
    method: "orea-z1",
    coffeeGrams: 18,
    waterGrams: 94,
    waterTempC: 90,
    c40Clicks: 28,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Fit the Switch adapter and close the valve. Add all 94g of water first.",
      },
      { at: 0, instruction: "Add 18g of coffee and stir gently 32 times." },
      { at: 90, instruction: "Open the valve and let it drain." },
      { at: 135, instruction: "Add 50-75g of bypass water to taste." },
      { at: 165, instruction: "Serve." },
    ],
  },
  {
    id: "orea-the-caramel",
    name: "The Caramel",
    author: "Orea",
    blurb:
      "A valve-controlled concentrate finished with cool bypass water for caramel sweetness.",
    notes:
      "Needs the Switch adapter and the MeloDrip. The finishing bypass water should be much cooler, around 60-75C, added to taste.",
    roast: "medium",
    grind: "coarse",
    method: "orea-z1",
    coffeeGrams: 18,
    waterGrams: 136,
    waterTempC: 94,
    c40Clicks: 28,
    totalSeconds: 210,
    steps: [
      {
        instruction:
          "Fit the Switch adapter and MeloDrip, rinse the filter and add 18g of coffee. Close the valve.",
      },
      { at: 0, instruction: "Bloom with 36g, valve closed." },
      { at: 40, instruction: "Open the valve and let it drain." },
      {
        at: 50,
        instruction: "Close the valve and pour 100g slowly to 136g total.",
      },
      {
        at: 80,
        instruction: "Remove the MeloDrip and stir gently for 10 seconds.",
      },
      { at: 170, instruction: "Open the valve and let it drain." },
      { at: 200, instruction: "Add 60-75g of cooler bypass water to taste." },
      { at: 210, instruction: "Serve." },
    ],
  },
  {
    id: "orea-the-tetsu",
    name: "The Tetsu",
    author: "Tetsu Kasuya",
    blurb:
      "Kasuya's two-temperature valve brew: hot pours for flavour, an 80C finish for softness.",
    notes:
      "Needs the Switch adapter and the MeloDrip. The final pour uses cooler water, around 80C.",
    roast: "medium",
    grind: "coarse",
    method: "orea-z1",
    coffeeGrams: 20,
    waterGrams: 300,
    waterTempC: 94,
    c40Clicks: 28,
    totalSeconds: 195,
    steps: [
      {
        instruction:
          "Fit the Switch adapter and MeloDrip, rinse the filter and add 20g of coffee. Close the valve.",
      },
      { at: 0, instruction: "Pour to 60g with the valve closed." },
      { at: 40, instruction: "Open the valve and pour to 120g total." },
      { at: 90, instruction: "Pour to 200g total." },
      {
        at: 120,
        instruction: "Close the valve and pour to 300g total with 80C water.",
      },
      { at: 165, instruction: "Open the valve and let it drain." },
      { at: 195, instruction: "Serve." },
    ],
  },
  {
    id: "orea-the-fine-z1",
    name: "The Fine Z1",
    author: "Orea",
    blurb: "A low-dose fine grind and one slow pour on the zero-bypass Z1.",
    notes:
      "Paper filter with the MeloDrip. Pour the main fill slowly, about 3 g/s.",
    roast: "light",
    grind: "fine",
    method: "orea-z1",
    coffeeGrams: 10,
    waterGrams: 200,
    waterTempC: 92,
    c40Clicks: 18,
    totalSeconds: 165,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 10g of coffee.",
      },
      { at: 0, instruction: "Spiral pour to 40g." },
      {
        at: 40,
        instruction: "Pour slowly to 200g total, about 3 g/s.",
      },
      { at: 165, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "orea-the-pulse",
    name: "The Pulse",
    author: "Martin Wölfl",
    blurb:
      "The champion's five-pulse Z1 recipe with widening gaps between pours.",
    notes:
      "Paper filter with the MeloDrip. Each pour is 40g; the rests get longer as the brew goes.",
    roast: "light",
    grind: "medium",
    method: "orea-z1",
    coffeeGrams: 12,
    waterGrams: 200,
    waterTempC: 96,
    c40Clicks: 24,
    totalSeconds: 200,
    steps: [
      {
        instruction:
          "Rinse the filter, fit the MeloDrip and add 12g of coffee.",
      },
      { at: 0, instruction: "Circular pour to 40g." },
      { at: 40, instruction: "Pour to 80g total." },
      { at: 85, instruction: "Pour to 120g total." },
      { at: 135, instruction: "Pour to 160g total." },
      { at: 170, instruction: "Pour to 200g total." },
      { at: 200, instruction: "Let it draw down and serve." },
    ],
  },
  {
    id: "wettpress-winner",
    name: "Juicy Inverted",
    author: "Community pick",
    blurb:
      "A long inverted steep that draws bright, juicy fruit from a light-roast coffee.",
    roast: "light",
    grind: "medium",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 21,
    waterGrams: 220,
    waterTempC: 88,
    c40Clicks: 22,
    totalSeconds: 135,
    steps: [
      { instruction: "Assemble the AeroPress inverted and rinse the filter." },
      { instruction: "Add 21g of medium ground coffee." },
      { at: 0, instruction: "Pour 220g of water at 88C and stir 10 times." },
      { at: 60, instruction: "Cap with the rinsed filter." },
      { at: 90, instruction: "Flip onto the cup and let it settle." },
      { at: 100, instruction: "Press steadily over 30 seconds." },
      { at: 135, instruction: "Stop before the hiss and serve." },
    ],
  },
  {
    id: "prismo-concentrate",
    name: "Prismo Concentrate",
    author: "Fellow style",
    blurb:
      "A short, pressure-valve style shot for a thick, espresso-like base.",
    roast: "dark",
    grind: "fine",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 20,
    waterGrams: 80,
    waterTempC: 90,
    c40Clicks: 13,
    totalSeconds: 75,
    steps: [
      { instruction: "Fit the metal filter cap and add 20g of fine coffee." },
      { at: 0, instruction: "Pour 80g of water and stir 5 times." },
      { at: 30, instruction: "Seat the plunger and let it steep." },
      { at: 45, instruction: "Press firmly over 25 seconds." },
      { at: 75, instruction: "Top with hot water or milk and serve." },
    ],
  },
  {
    id: "cocoa-bomb",
    name: "Cocoa Bomb",
    author: "AeroPress classic",
    blurb: "A comforting, cocoa-heavy cup with a thick body for dark roasts.",
    roast: "dark",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 17,
    waterGrams: 250,
    waterTempC: 84,
    c40Clicks: 24,
    totalSeconds: 150,
    steps: [
      { instruction: "Rinse the filter and add 17g of medium ground coffee." },
      { at: 0, instruction: "Pour 250g of water at 84C and stir twice." },
      { at: 60, instruction: "Insert the plunger and let it steep." },
      { at: 120, instruction: "Press gently over 25 seconds." },
      { at: 150, instruction: "Serve." },
    ],
  },
  {
    id: "midnight-inverted",
    name: "Midnight Inverted",
    author: "AeroPress classic",
    blurb:
      "A long, low-temperature inverted steep that smooths out bold dark roasts.",
    roast: "dark",
    grind: "coarse",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 20,
    waterGrams: 220,
    waterTempC: 80,
    c40Clicks: 30,
    totalSeconds: 195,
    steps: [
      { instruction: "Assemble inverted and add 20g of coarse ground coffee." },
      { at: 0, instruction: "Pour 220g of water at 80C and stir 3 times." },
      { at: 150, instruction: "Cap and flip onto the cup." },
      { at: 170, instruction: "Press slowly over 25 seconds." },
      { at: 195, instruction: "Stop at the hiss and serve." },
    ],
  },
  {
    id: "dark-latte-base",
    name: "Dark Latte Base",
    author: "Barista pick",
    blurb:
      "A thick dark-roast concentrate built to disappear under steamed milk.",
    roast: "dark",
    grind: "fine",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 19,
    waterGrams: 100,
    waterTempC: 86,
    c40Clicks: 13,
    totalSeconds: 90,
    steps: [
      { instruction: "Assemble inverted and add 19g of fine ground coffee." },
      { at: 0, instruction: "Pour 100g of water and stir well." },
      { at: 45, instruction: "Cap and flip onto the cup." },
      { at: 60, instruction: "Press firmly over 25 seconds." },
      { at: 90, instruction: "Top with steamed milk to serve." },
    ],
  },
  {
    id: "campfire-dark",
    name: "Campfire Dark",
    author: "Everyday brew",
    blurb: "A rugged, full-bodied mug for camp grinds and very dark roasts.",
    roast: "dark",
    grind: "coarse",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 16,
    waterGrams: 240,
    waterTempC: 82,
    c40Clicks: 32,
    totalSeconds: 165,
    steps: [
      { instruction: "Rinse the filter and add 16g of coarse ground coffee." },
      { at: 0, instruction: "Pour 240g of water at 82C and stir once." },
      { at: 120, instruction: "Swirl gently to settle the grounds." },
      { at: 140, instruction: "Press slowly over 25 seconds." },
      { at: 165, instruction: "Serve." },
    ],
  },
  {
    id: "espresso-romano",
    name: "Espresso Romano",
    author: "AeroPress classic",
    blurb: "A short, intense dark shot finished with a twist of lemon.",
    roast: "dark",
    grind: "fine",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 18,
    waterGrams: 70,
    waterTempC: 90,
    c40Clicks: 12,
    totalSeconds: 45,
    steps: [
      { instruction: "Rinse the filter and add 18g of fine ground coffee." },
      { at: 0, instruction: "Pour 70g of water and stir 5 times." },
      { at: 20, instruction: "Seat the plunger." },
      { at: 25, instruction: "Press firmly over 20 seconds." },
      { at: 45, instruction: "Serve with a twist of lemon peel." },
    ],
  },
  {
    id: "honey-medium",
    name: "Honey Medium",
    author: "Barista pick",
    blurb: "A honeyed, syrupy medium-roast cup with gentle agitation.",
    roast: "medium",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 16,
    waterGrams: 240,
    waterTempC: 91,
    c40Clicks: 23,
    totalSeconds: 150,
    steps: [
      { instruction: "Rinse the filter and add 16g of medium ground coffee." },
      { at: 0, instruction: "Add 40g to bloom and stir gently." },
      { at: 30, instruction: "Pour to 240g total." },
      { at: 90, instruction: "Insert the plunger and steep." },
      { at: 130, instruction: "Press over 20 seconds." },
      { at: 150, instruction: "Serve." },
    ],
  },
  {
    id: "lance-hedrick-dark-aeropress",
    name: "Lance Hedrick Dark Roast AeroPress",
    author: "Lance Hedrick",
    blurb:
      "A high-dose, low-temperature concentrate for decaf, dark, baked or aged coffee, diluted to taste after pressing.",
    notes:
      "Built for decaf, dark, baked, or past-prime coffee. Stir aggressively, give it a long steep, then dilute to taste after pressing.",
    roast: "dark",
    grind: "coarse",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 30,
    waterGrams: 120,
    waterTempC: 80,
    c40Clicks: 35,
    totalSeconds: 120,
    steps: [
      {
        instruction:
          "Assemble the AeroPress inverted and add 30g of coarse coffee.",
      },
      {
        at: 0,
        instruction:
          "Pour all 120g of water at once, then stir aggressively for 10 seconds.",
      },
      { at: 60, instruction: "Add the lid and press for about one minute." },
      {
        at: 120,
        instruction: "Dilute with 80-120g of water to taste and serve.",
      },
    ],
  },
];

export function getRecipe(id: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.id === id);
}

// Short "method · roast" descriptor shown under saved recipes so the brewer
// and roast type are clear at a glance.
export function recipeTypeLabel(recipe: Recipe): string {
  return `${METHOD_LABELS[recipe.method]} · ${ROAST_LABELS[recipe.roast]} roast`;
}

// Method · ratio · time descriptor shown under recipes in browse lists.
export function recipeMetaLabel(recipe: Recipe): string {
  const parts = [METHOD_LABELS[recipe.method]];
  if (recipe.coffeeGrams > 0) {
    const ratio =
      Math.round((recipe.waterGrams / recipe.coffeeGrams) * 10) / 10;
    parts.push(`1:${ratio}`);
  }
  parts.push(formatDuration(recipe.totalSeconds));
  return parts.join(" · ");
}

export type SortKey = "default" | "recent" | "quick" | "strong";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "recent", label: "Recently used" },
  { key: "quick", label: "Quickest" },
  { key: "strong", label: "Strongest" },
];

function brewRatio(recipe: Recipe): number {
  return recipe.coffeeGrams > 0
    ? recipe.waterGrams / recipe.coffeeGrams
    : Number.POSITIVE_INFINITY;
}

// Sort recipes by the chosen key. `recentIds` is the recently-viewed order
// (most recent first), used by the "recent" sort.
export function sortRecipes(
  list: Recipe[],
  key: SortKey,
  recentIds: string[] = []
): Recipe[] {
  if (key === "default") {
    return list;
  }
  const copy = [...list];
  if (key === "quick") {
    return copy.sort((a, b) => a.totalSeconds - b.totalSeconds);
  }
  if (key === "strong") {
    return copy.sort((a, b) => brewRatio(a) - brewRatio(b));
  }
  const rank = (id: string) => {
    const index = recentIds.indexOf(id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return copy.sort((a, b) => rank(a.id) - rank(b.id));
}

// Bounds for an adjusted coffee dose, in grams.
export const MIN_COFFEE_GRAMS = 5;
export const MAX_COFFEE_GRAMS = 60;

const ROAST_ORDER: Record<Roast, number> = { light: 0, medium: 1, dark: 2 };
// Water temperature offset applied per roast: lighter brews hotter, darker
// cooler. Applied as a delta from the recipe's original roast/temp.
const ROAST_TEMP_OFFSET: Record<Roast, number> = {
  light: 0,
  medium: -4,
  dark: -8,
};
// Comandante clicks shift per roast step darker (coarser grind for dark roast).
const ROAST_CLICK_STEP = 3;
const GRIND_ORDER: Grind[] = ["fine", "medium", "coarse"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Recompute a recipe for a new coffee dose and roast. Water tracks the dose at
// the original ratio; temperature, grind and clicks shift with the roast; and
// every gram/temperature amount written into the steps is rescaled to match.
export function scaleRecipe(
  original: Recipe,
  coffeeGrams: number,
  roast: Roast
): Recipe {
  const dose = clamp(
    Math.round(coffeeGrams),
    MIN_COFFEE_GRAMS,
    MAX_COFFEE_GRAMS
  );
  const factor = dose / original.coffeeGrams;
  const scaleGrams = (grams: number) => Math.round(grams * factor);
  const roastShift = ROAST_ORDER[roast] - ROAST_ORDER[original.roast];
  const waterTempC = clamp(
    original.waterTempC +
      ROAST_TEMP_OFFSET[roast] -
      ROAST_TEMP_OFFSET[original.roast],
    80,
    100
  );
  const grindIndex = clamp(
    GRIND_ORDER.indexOf(original.grind) + roastShift,
    0,
    GRIND_ORDER.length - 1
  );
  const c40Clicks = clamp(
    original.c40Clicks + roastShift * ROAST_CLICK_STEP,
    6,
    40
  );
  const steps = original.steps.map((step) => ({
    ...step,
    instruction: step.instruction
      .replace(/(\d+)g/g, (_match, grams) => `${scaleGrams(Number(grams))}g`)
      .replace(/\d+C/g, () => `${waterTempC}C`),
  }));
  return {
    ...original,
    c40Clicks,
    coffeeGrams: dose,
    grind: GRIND_ORDER[grindIndex],
    roast,
    steps,
    waterGrams: scaleGrams(original.waterGrams),
    waterTempC,
  };
}

export interface Category {
  blurb: string;
  id: string;
  match: (recipe: Recipe) => boolean;
  // The brew method this browse category belongs to. Categories are grouped
  // under per-method tabs on the recipes screen.
  method: BrewMethod;
  name: string;
}

// Cross-method browse facets. For each method we surface an "All" category
// plus any of these facets that actually match at least one recipe, so empty
// combinations (e.g. an espresso-sized V60) never appear.
interface BrowseFacet {
  blurb: string;
  id: string;
  match: (recipe: Recipe) => boolean;
  name: string;
}

// AeroPress-specific browse lenses: the two chamber orientations plus
// strength, size and roast cuts.
const AEROPRESS_FACETS: BrowseFacet[] = [
  {
    id: "espresso",
    name: "Espresso & concentrate",
    blurb: "Small, intense shots",
    match: (recipe) => recipe.waterGrams <= 120,
  },
  {
    id: "inverted",
    name: "Inverted",
    blurb: "Brewed upside-down",
    match: (recipe) => recipe.orientation === "inverted",
  },
  {
    id: "upright",
    name: "Upright",
    blurb: "Classic standard position",
    match: (recipe) => recipe.orientation === "standard",
  },
  {
    id: "go",
    name: "AeroPress Go",
    blurb: "Single-serve brews that fit the Go",
    // The Go's chamber comfortably holds up to the ④ mark (~240ml); larger
    // batches need the full-size brewer or a separate server.
    match: (recipe) => recipe.waterGrams <= 240,
  },
  {
    id: "for-two",
    name: "For two",
    blurb: "Bigger batches to share",
    match: (recipe) => recipe.waterGrams >= 300,
  },
  {
    id: "bold-dark",
    name: "Bold & dark",
    blurb: "Rich cups for darker roasts",
    match: (recipe) => recipe.roast === "dark",
  },
  {
    id: "light-bright",
    name: "Light & bright",
    blurb: "Delicate, fruity light roasts",
    match: (recipe) => recipe.roast === "light",
  },
];

// V60 browse lenses: pour-overs have no orientation, so cut by size and roast.
const V60_FACETS: BrowseFacet[] = [
  {
    id: "for-two",
    name: "For two",
    blurb: "Bigger batches to share",
    match: (recipe) => recipe.waterGrams >= 450,
  },
  {
    id: "bold-dark",
    name: "Bold & dark",
    blurb: "Rich cups for darker roasts",
    match: (recipe) => recipe.roast === "dark",
  },
  {
    id: "light-bright",
    name: "Light & bright",
    blurb: "Delicate, fruity light roasts",
    match: (recipe) => recipe.roast === "light",
  },
];

const METHOD_FACETS: Record<BrewMethod, BrowseFacet[]> = {
  aeropress: AEROPRESS_FACETS,
  v60: V60_FACETS,
  // Orea's flat-bottom drippers share the V60's size/roast browse lenses.
  "orea-o1": V60_FACETS,
  "orea-z1": V60_FACETS,
};

// Methods always shown in the browse dropdown.
export const DEFAULT_METHODS: BrewMethod[] = ["aeropress", "v60"];
// Extra brewers the user can enable from Settings.
export const OPTIONAL_METHODS: BrewMethod[] = ["orea-o1", "orea-z1"];

export const BROWSE_METHODS: BrewMethod[] = [
  ...DEFAULT_METHODS,
  ...OPTIONAL_METHODS,
];

function buildCategories(): Category[] {
  const result: Category[] = [];
  for (const method of BROWSE_METHODS) {
    const label = METHOD_LABELS[method];
    result.push({
      id: `all-${method}`,
      name: `All ${label}`,
      blurb: `Every ${label} recipe`,
      method,
      match: (recipe) => recipe.method === method,
    });
    for (const facet of METHOD_FACETS[method]) {
      const match = (recipe: Recipe) =>
        recipe.method === method && facet.match(recipe);
      if (recipes.some(match)) {
        result.push({
          id: `${method}-${facet.id}`,
          name: facet.name,
          blurb: facet.blurb,
          method,
          match,
        });
      }
    }
  }
  return result;
}

export const categories: Category[] = buildCategories();

export function categoriesForMethod(method: BrewMethod): Category[] {
  return categories.filter((category) => category.method === method);
}

export function getCategory(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function categoryRecipes(category: Category): Recipe[] {
  return recipes.filter(category.match);
}

export interface Filters {
  brewTime: BrewTime | null;
  grind: Grind | null;
  method: BrewMethod | null;
  orientation: Orientation | null;
  query: string;
  roast: Roast | null;
}

export function filterRecipes(filters: Filters): Recipe[] {
  const query = filters.query.trim().toLowerCase();
  return recipes.filter((recipe) => {
    if (query && !recipe.name.toLowerCase().includes(query)) {
      return false;
    }
    if (filters.roast && recipe.roast !== filters.roast) {
      return false;
    }
    if (filters.grind && recipe.grind !== filters.grind) {
      return false;
    }
    if (filters.method && recipe.method !== filters.method) {
      return false;
    }
    if (filters.orientation && recipe.orientation !== filters.orientation) {
      return false;
    }
    if (
      filters.brewTime &&
      brewTimeBucket(recipe.totalSeconds) !== filters.brewTime
    ) {
      return false;
    }
    return true;
  });
}
