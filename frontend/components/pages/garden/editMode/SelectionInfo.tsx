import { StyleSheet, View } from "react-native";
import React from "react";
import StyledText from "../../../style/StyledText";
import { Styling } from "../../../../constants/Styling";
import { BAR_MARGIN } from "../../../../constants/tabConfig";

const SelectionInfo = ({
	isMoving,
	selectedCell,
	selectedPlantName,
}: {
	isMoving: boolean;
	selectedCell: { x: number; y: number } | null;
	selectedPlantName: string;
}) => {
	const text = isMoving
		? "Kies een nieuwe locatie..."
		: selectedCell
			? `Geselecteerd: ${selectedPlantName}`
			: "Geen plant geselecteerd";

	return (
		<View style={styles.row}>
			<StyledText type="head3" style={styles.text}>
				{text}
			</StyledText>
		</View>
	);
};

export default SelectionInfo;

const styles = StyleSheet.create({
	row: {
		alignItems: "center",
		paddingHorizontal: BAR_MARGIN,
	},
	text: {
		color: Styling.Colors.white,
		alignSelf: "flex-start",
	},
});
