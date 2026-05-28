import { View, Dimensions, StyleSheet, ViewStyle } from "react-native";
import React from "react";
import VegetableCard, { VegetableCardProps } from "./VegetableCard";
import { Styling } from "../../../constants/Styling";

interface CardContainerProps {
	data: VegetableCardProps[];
	columns?: number;
	style?: ViewStyle;
	onItemPress?: (id: string) => void;
}

const CardContainer = ({ data, columns = 3, style, onItemPress }: CardContainerProps) => {
	const screenWidth = Dimensions.get("window").width;
	const gap = Styling.Spacing.reg;
	const padding = 40;
	const availableWidth = screenWidth - gap * (columns - 1) - padding;
	const cardWidth = availableWidth / columns;

	const totalSlots = Math.ceil(data.length / columns) * columns;
	const placeholders = totalSlots - data.length;

	return (
		<View style={[styles.container, { gap }, style]}>
			{data.map((item) => (
				<View key={item.id} style={{ width: cardWidth }}>
					<VegetableCard vegetable={onItemPress ? { ...item, onPress: () => onItemPress(item.id) } : item} />
				</View>
			))}
			{Array.from({ length: placeholders }).map((_, i) => (
				<View key={`placeholder-${i}`} style={{ width: cardWidth }} />
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
	},
});

export default CardContainer;
