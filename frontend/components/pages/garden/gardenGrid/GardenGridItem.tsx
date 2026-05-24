import { Image, StyleSheet, View } from "react-native";
import React from "react";
import WarningIcon from "../../../../assets/icons/warning.svg";
import StyledIcon from "../../../style/StyledIcon";
import { Styling } from "../../../../constants/Styling";

export interface PlantStatusData {
	level: number;
	label: string;
	optimalMin: number;
	optimalMax: number;
}

export interface GardenPlant {
	id: string;
	image: number | { uri: string };
	warning: boolean;
	x: number;
	y: number;
	nickname: string;
	type: string;
	stage: { current: number; max: number; label: string };
	water: PlantStatusData;
	light: PlantStatusData;
	temperature: PlantStatusData;
	advice: string;
	battery: number;
	probeName: string;
}

const GardenGridItem = ({ plant }: { plant: GardenPlant }) => {
	return (
		<View style={styles.wrapper}>
			<Image source={plant.image} style={styles.image} resizeMode="contain" />
			{plant.warning && <StyledIcon Icon={WarningIcon} style={styles.icon} size="reg"/>}
		</View>
	);
};

export default GardenGridItem;

const styles = StyleSheet.create({
	wrapper: {
		position: "relative",
		alignItems: "center",
		justifyContent: "center",

		width: "90%",
		height: "90%",
	},
	image: {
		width: "100%",
		height: "100%",
	},
	icon: {
		position: "absolute",
		top: 0,
		right: 0,

		backgroundColor: Styling.Colors.red,
		padding: 5,
		borderRadius: Styling.BorderRadius.lrg,
	},
});
