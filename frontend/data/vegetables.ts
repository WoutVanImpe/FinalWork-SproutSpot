export interface VegetableInfo {
  id: string;
  name: string;
  image: number;
}

export interface StageDetail {
  label: string;
  durationDays: number;
}

export interface VegetableDetail extends VegetableInfo {
  light: string;
  water: string;
  difficulty: string;
  temperature: { min: number; max: number };
  placement: "inside" | "outside" | "both";
  sunlight: "full" | "partial" | "shade";
  careLevel: "daily" | "weekly" | "minimal";
  sowingDepth: string;
  sowingDistance: string;
  potDepth: string;
  sowingPeriod: { startMonth: number; endMonth: number };
  stages: StageDetail[];
  totalDays: number;
}

const vegetableImages: Record<string, number> = {
  tomato: require("../assets/vegetables/tomato.png"),
  cabbage: require("../assets/vegetables/cabbage.png"),
};

export const VEGETABLES: VegetableInfo[] = [
  { id: "veg_tomato", name: "Tomaat", image: vegetableImages.tomato },
  { id: "veg_cabbage", name: "Kool", image: vegetableImages.cabbage },
];

export const VEGETABLE_DETAILS: Record<string, VegetableDetail> = {
  veg_tomato: {
    id: "veg_tomato",
    name: "Tomaat",
    image: vegetableImages.tomato,
    light: "Volle zon",
    water: "Dagelijks",
    difficulty: "Gemiddeld",
    temperature: { min: 18, max: 28 },
    placement: "both",
    sunlight: "full",
    careLevel: "daily",
    sowingDepth: "0.5 cm",
    sowingDistance: "50 cm",
    potDepth: "15 cm",
    sowingPeriod: { startMonth: 3, endMonth: 5 },
    stages: [
      { label: "Zaaien", durationDays: 7 },
      { label: "Kiem", durationDays: 14 },
      { label: "Blad", durationDays: 21 },
      { label: "Groeispurt", durationDays: 21 },
      { label: "Bloei", durationDays: 14 },
      { label: "Oogst", durationDays: 13 },
    ],
    totalDays: 90,
  },
  veg_cabbage: {
    id: "veg_cabbage",
    name: "Kool",
    image: vegetableImages.cabbage,
    light: "Halfschaduw",
    water: "Om de dag",
    difficulty: "Gemakkelijk",
    temperature: { min: 12, max: 22 },
    placement: "outside",
    sunlight: "partial",
    careLevel: "weekly",
    sowingDepth: "1 cm",
    sowingDistance: "40 cm",
    potDepth: "12 cm",
    sowingPeriod: { startMonth: 4, endMonth: 6 },
    stages: [
      { label: "Zaaien", durationDays: 10 },
      { label: "Kiem", durationDays: 15 },
      { label: "Blad", durationDays: 25 },
      { label: "Groeispurt", durationDays: 20 },
      { label: "Oogst", durationDays: 15 },
    ],
    totalDays: 85,
  },
};

function monthName(m: number): string {
  const names = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return names[m - 1] || "";
}

export function formatSowingPeriod(start: number, end: number): string {
  if (start <= end) return `${monthName(start)}-${monthName(end)}`;
  return `${monthName(start)}-${monthName(end)}`;
}

export function formatTemperature(min: number, max: number): string {
  return `${min}°C - ${max}°C`;
}

export function getStageDescription(type: string, stageIndex: number): string {
  const descriptions: Record<string, string[]> = {
    Tomaat: [
      "Zaai de tomatenzaden in vochtige potgrond op een warme plek.",
      "De zaden ontkiemen. Kleine kiemblaadjes verschijnen boven de grond.",
      "De plant ontwikkelt echte bladeren. Verpot naar een grotere pot.",
      "De plant maakt veel blad aan. Verhoog de watergift en begin met bemesting.",
      "Bloemknoppen verschijnen. Zorg voor goede luchtcirculatie.",
      "De tomaten zijn rijp en kunnen geoogst worden.",
    ],
    Kool: [
      "Zaai de koolzaden in zaaitrays met lichte potgrond.",
      "De zaden ontkiemen en kleine kiemplantjes verschijnen.",
      "De plant vormt stevige bladeren. Verplant naar de definitieve plek.",
      "De kool begint een krop te vormen. Gelijkmatig water geven is nu belangrijk.",
      "De kool is volgroeid en klaar om geoogst te worden.",
    ],
  };
  return (descriptions[type] || descriptions.Tomaat)[stageIndex] || "";
}
