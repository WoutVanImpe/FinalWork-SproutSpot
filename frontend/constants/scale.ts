import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const REFERENCE_WIDTH = 443;

export const scale = SCREEN_WIDTH / REFERENCE_WIDTH;
export const scaled = (n: number) => Math.round(n * Math.min(scale, 1.35));
