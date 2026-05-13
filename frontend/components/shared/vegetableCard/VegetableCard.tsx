import { StyleSheet, View, Image } from "react-native";
import React from "react";
import StyledText from "../../style/StyledText";
import WarningIcon from "../../../assets/icons/warning.svg";
import { Styling } from "../../../constants/Styling";
import StyledIcon from "../../style/StyledIcon";

export interface VegetableCardProps {
	id: string | number;
	name: string;
	image: number | { uri: string };
	warning?: boolean;
}

const VegetableCard = ({ vegetable }: { vegetable: VegetableCardProps }) => {
	return (
		<View style={styles.card}>
			{vegetable.warning && (
				<View style={styles.warningBadge}>
					<StyledIcon Icon={WarningIcon} size="reg" fill={Styling.Colors.white} />
				</View>
			)}
			<Image source={vegetable.image} style={styles.image} resizeMode="contain" />
			<StyledText type="paragh">{vegetable.name}</StyledText>
		</View>
	);
};

export default VegetableCard;

const styles = StyleSheet.create({
	card: {
		position: "relative",
		alignItems: "center",
		elevation: 2,
		minHeight: 130,
	},
	image: {
		width: "100%",
		height: 100,
		marginBottom: Styling.Spacing.xsm,
	},
	warningBadge: {
		padding: 2,
		backgroundColor: Styling.Colors.red,
		borderRadius: Styling.BorderRadius.lrg,
		position: "absolute",
		top: 0,
		right: -10,
		zIndex: 1,
	},
});
