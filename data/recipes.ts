export type Roast = "light" | "medium" | "dark";
export type Grind = "fine" | "medium" | "coarse";
export type Orientation = "standard" | "inverted";
export type BrewMethod = "aeropress" | "v60";
export type BrewTime = "short" | "medium" | "long";

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
    roast: "light",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 11,
    waterGrams: 200,
    waterTempC: 99,
    c40Clicks: 14,
    totalSeconds: 210,
    steps: [
      {
        instruction: "Set the brewer in standard position with a paper filter.",
      },
      { at: 0, instruction: "Add all 200g of water to fully wet the coffee." },
      {
        at: 10,
        instruction: "Insert the plunger about 1cm to create a vacuum.",
      },
      { at: 120, instruction: "Gently swirl the brewer." },
      { at: 150, instruction: "Let the coffee settle and wait." },
      { at: 180, instruction: "Press gently for about 30 seconds." },
      { at: 210, instruction: "Serve and enjoy." },
    ],
  },
  {
    id: "13g-that-makes-you-happy",
    name: "13g that makes you happy",
    author: "Sigit Tri",
    blurb:
      "A balanced, sweet cup designed to work across most coffee processes while avoiding under-extraction.",
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
        at: 95,
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
    roast: "light",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 14,
    waterGrams: 200,
    waterTempC: 96,
    c40Clicks: 18,
    totalSeconds: 90,
    steps: [
      { instruction: "Rinse the paper filter for about 10 seconds." },
      { instruction: "Add 14g of ground coffee." },
      { at: 0, instruction: "Pour 200g of water at 96C." },
      {
        at: 10,
        instruction: "Stir 3 times back to front and attach the handle.",
      },
      {
        at: 60,
        instruction: "Remove the handle and stir 3 times back to front.",
      },
      {
        at: 65,
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
    roast: "dark",
    grind: "medium",
    orientation: "inverted",
    method: "aeropress",
    coffeeGrams: 18,
    waterGrams: 60,
    waterTempC: 92,
    c40Clicks: 14,
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
    roast: "light",
    grind: "medium",
    orientation: "standard",
    method: "aeropress",
    coffeeGrams: 30,
    waterGrams: 400,
    waterTempC: 93,
    c40Clicks: 25,
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
        at: 10,
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
      { at: 40, instruction: "Cap and wait." },
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
      { at: 300, instruction: "Cap, flip onto the cup." },
      { at: 320, instruction: "Press slowly." },
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
      { at: 120, instruction: "Swirl gently." },
      { at: 135, instruction: "Press very slowly." },
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
      { at: 135, instruction: "Swirl, then insert plunger." },
      { at: 150, instruction: "Press slowly." },
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
      "His one-cup V60 method: a high dose, a quick bloom and a gentle two-stage pour for a sweet, even cup.",
    roast: "light",
    grind: "medium",
    method: "v60",
    coffeeGrams: 30,
    waterGrams: 500,
    waterTempC: 95,
    c40Clicks: 28,
    totalSeconds: 225,
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
      { at: 225, instruction: "Let it draw down completely, then serve." },
    ],
  },
  {
    id: "kasuya-46-method",
    name: "Tetsu Kasuya 4:6 Method",
    author: "Tetsu Kasuya",
    blurb:
      "The World Brewers Cup method. The first 40% of water dials in sweetness and acidity; the last 60% sets the strength.",
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
      { at: 0, instruction: "Pour 50g and let it bloom." },
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
      "A balanced cafe-standard pour-over with a short bloom and three even pulse pours.",
    roast: "medium",
    grind: "medium",
    method: "v60",
    coffeeGrams: 22,
    waterGrams: 350,
    waterTempC: 96,
    c40Clicks: 25,
    totalSeconds: 210,
    steps: [
      { instruction: "Rinse the filter and add 22g of medium ground coffee." },
      { at: 0, instruction: "Pour 50g to bloom and stir gently." },
      { at: 45, instruction: "Pour to 150g total in slow circles." },
      { at: 90, instruction: "Pour to 250g total." },
      { at: 130, instruction: "Pour to 350g total." },
      { at: 210, instruction: "Let the bed draw down and serve." },
    ],
  },
  {
    id: "hedrick-beginner-pour-over",
    name: "Lance Hedrick Beginner Pour Over",
    author: "Lance Hedrick",
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
    name: "Wendelboe Nordic V60",
    author: "Tim Wendelboe",
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
    name: "April Simple V60",
    author: "April Coffee",
    blurb:
      "A modern, low-agitation recipe with three pours for a clean, sweet, repeatable cup.",
    roast: "light",
    grind: "medium",
    method: "v60",
    coffeeGrams: 18,
    waterGrams: 300,
    waterTempC: 96,
    c40Clicks: 24,
    totalSeconds: 195,
    steps: [
      { instruction: "Rinse the filter and add 18g of coffee." },
      { at: 0, instruction: "Pour 50g to bloom and swirl." },
      { at: 45, instruction: "Pour to 150g total." },
      { at: 90, instruction: "Pour to 300g total." },
      { at: 195, instruction: "Let it draw down and serve." },
    ],
  },
];

export function getRecipe(id: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.id === id);
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

const BROWSE_FACETS: BrowseFacet[] = [
  {
    id: "espresso-short",
    name: "Espresso & short",
    blurb: "Small, intense concentrates",
    match: (recipe) => recipe.waterGrams <= 120,
  },
  {
    id: "filter-style",
    name: "Filter style",
    blurb: "Clean, tea-like clarity",
    match: (recipe) =>
      recipe.orientation === "standard" && recipe.grind !== "fine",
  },
  {
    id: "for-two",
    name: "For two",
    blurb: "Bigger batches, 240g and up",
    match: (recipe) => recipe.waterGrams >= 240,
  },
  {
    id: "quick",
    name: "Quick",
    blurb: "Done in under two minutes",
    match: (recipe) => recipe.totalSeconds < 120,
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

export const BROWSE_METHODS: BrewMethod[] = ["aeropress", "v60"];

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
    for (const facet of BROWSE_FACETS) {
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
  roast: Roast | null;
}

export function filterRecipes(filters: Filters): Recipe[] {
  return recipes.filter((recipe) => {
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
