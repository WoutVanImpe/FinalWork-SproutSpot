import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledText from "../../../style/StyledText";
import StyledButton from "../../../style/StyledButton";
import WaveBackground from "../../../shared/WaveBackground";

interface ExploreHeaderProps {
	onButtonPress: () => void;
}

const ExploreHeader = ({ onButtonPress }: ExploreHeaderProps) => {
	return (
		<View style={styles.container}>
			<WaveBackground />

			<View style={styles.content}>
				<StyledText type="head1" style={styles.title}>
					Vind de ideale match!
				</StyledText>
				<TouchableOpacity onPress={onButtonPress}>
					<StyledButton inverted>Zoeken</StyledButton>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default ExploreHeader;

const styles = StyleSheet.create({
	container: {
		height: 260,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "transparent",

		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.4,
		shadowRadius: 16,
		elevation: 12,
	},
	content: {
		alignItems: "center",
		justifyContent: "center",
		zIndex: 2,
		gap: Styling.Spacing.reg,
		marginTop: -25,
	},
	title: {
		color: Styling.Colors.white,
		textAlign: "center",
		width: 300,
		lineHeight: 40,
	},
});
