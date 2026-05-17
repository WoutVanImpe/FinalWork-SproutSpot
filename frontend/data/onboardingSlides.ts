import { ImageSourcePropType } from "react-native";

export interface OnboardingSlide {
	title: string;
	text: string;
	position: "topLeft" | "bottomLeft" | "topCenter" | "topRight";
	bg: ImageSourcePropType;
}

export const slides: OnboardingSlide[] = [
	{
		title: "Tuinieren tussen het beton!",
		text: "Wil je groen op je balkon, maar weet je niet wat er groeit in de stad? Wij helpen je starten op jouw unieke plekje.",
		position: "topLeft",
		bg: require("../assets/images/onboarding1.png"),
	},
	{
		title: "Orde in je groene chaos!",
		text: "Sleep je planten naar de juiste plek op je scherm. Zo zie je in één oogopslag welke plant aandacht nodig heeft.",
		position: "topRight",
		bg: require("../assets/images/onboarding2.png"),
	},
	{
		title: "Krijg een gerust hart!",
		text: "Krijg notificaties van de sensoren moest er iets aan de hand zijn, zodat jij met een gerust hart kan tuinieren.",
		position: "bottomLeft",
		bg: require("../assets/images/onboarding3.png"),
	},
	{
		title: "Ontdek SproutSpot!",
		text: "Maak een account aan en start met je eigen moestuin!",
		position: "topCenter",
		bg: require("../assets/images/onboarding4.png"),
	},
];
