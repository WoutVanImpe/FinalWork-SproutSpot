import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React, { memo } from "react";
import StyledText from "../../style/StyledText";
import WarningIcon from "../../../assets/icons/warning.svg";
import { Styling } from "../../../constants/Styling";
import StyledIcon from "../../style/StyledIcon";
import { scaled } from "../../../constants/scale";

export interface VegetableCardProps {
	id: string;
	name: string;
	image: number | { uri: string };
	warning?: boolean;
	onPress?: () => void;
}

const VegetableCard = memo(({ vegetable }: { vegetable: VegetableCardProps }) => {
	const content = (
		<View style={styles.card}>
			{vegetable.warning && (
				<View style={styles.warningBadge}>
					<StyledIcon Icon={WarningIcon} size="reg" fill={Styling.Colors.white} />
				</View>
			)}
			<Image source={vegetable.image} style={styles.image} resizeMode="contain" fadeDuration={0} />
			<StyledText type="paragh" style={styles.name}>{vegetable.name}</StyledText>
		</View>
	);

	if (vegetable.onPress) {
		return <TouchableOpacity onPress={vegetable.onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
	}
	return content;
});

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
		height: scaled(100),
		marginBottom: Styling.Spacing.xsm,
	},
	name: {
		textAlign: "center",
	},
	warningBadge: {
		padding: 2,
		backgroundColor: Styling.Colors.red,
		borderRadius: Styling.BorderRadius.lrg,
		position: "absolute",
		top: 0,
		right: scaled(-10),
		zIndex: 1,
	},
});


