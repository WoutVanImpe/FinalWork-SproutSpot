import { View, Dimensions, StyleSheet } from "react-native";
import React from "react";
import VegetableCard, { VegetableCardProps } from "./VegetableCard";
import { Styling } from "../../../constants/Styling";

interface CardContainerProps {
	data: VegetableCardProps[];
	columns?: number;
}

const CardContainer = ({ data, columns = 3 }: CardContainerProps) => {
	const screenWidth = Dimensions.get("window").width;
	const gap = Styling.Spacing.reg;
	const availableWidth = screenWidth - gap * (columns - 1) - 10;
	const cardWidth = availableWidth / columns - gap * (columns - 1) - 10;

	return (
		<View style={[styles.container, { gap }]}>
			{data.map((item) => (
				<View key={item.id} style={{ width: cardWidth }}>
					<VegetableCard vegetable={item} />
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		flexWrap: "wrap",
		width: "100%",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 300,
	},
});

export default CardContainer;
