export interface VegetableInfo {
  id: string;
  name: string;
  image: number;
}

const vegetableImages: Record<string, number> = {
  tomato: require("../assets/vegetables/tomato.png"),
  cabbage: require("../assets/vegetables/cabbage.png"),
};

export const VEGETABLES: VegetableInfo[] = [
  { id: "veg_tomato", name: "Tomaat", image: vegetableImages.tomato },
  { id: "veg_cabbage", name: "Kool", image: vegetableImages.cabbage },
];
