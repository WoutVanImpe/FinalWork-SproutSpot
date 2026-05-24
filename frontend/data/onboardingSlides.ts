export interface OnboardingSlide {
	title: string;
	text: string;
	position: "topLeft" | "topRight" | "bottomLeft" | "topCenter";
	bg: number;
}

export const slides: OnboardingSlide[] = [
	{
		title: "Tuinieren tussen het beton!",
		text: "Wil je groen op je balkon of in huis, maar weet je niet waar te beginnen? SproutSpot helpt je stap voor stap.",
		position: "topLeft",
		bg: require("../assets/images/onboarding1.png"),
	},
	{
		title: "Orde in je groene chaos!",
		text: "Sleep je planten naar de juiste plek in je digitale tuin. Houd overzicht, verplaats en ruil ze eenvoudig.",
		position: "topRight",
		bg: require("../assets/images/onboarding2.png"),
	},
	{
		title: "Krijg een gerust hart!",
		text: "Krijg notificaties van de sensoren wanneer je plant water nodig heeft, te donker staat of het te warm krijgt.",
		position: "bottomLeft",
		bg: require("../assets/images/onboarding3.png"),
	},
	{
		title: "Ontdek SproutSpot!",
		text: "Maak een account aan en start meteen met het ontwerpen van jouw droomtuin. Geen ervaring nodig!",
		position: "topCenter",
		bg: require("../assets/images/onboarding4.png"),
	},
];
