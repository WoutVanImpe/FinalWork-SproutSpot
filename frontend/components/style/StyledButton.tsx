import { StyleSheet, View, ViewStyle } from "react-native";
import { Styling } from "../../constants/Styling";
import React, { ReactNode } from "react";
import StyledText from "./StyledText";

const StyledButton = ({ style, fullCap = false, inverted = false, children, ...props }: { style?: ViewStyle; fullCap?: boolean; inverted?: boolean; children?: ReactNode }) => {
	return (
		<View style={[styles.button, { backgroundColor: inverted ? Styling.Colors.white : Styling.Colors.green }, style]} {...props}>
			<StyledText type="head4" fullCap={fullCap} style={{ color: inverted ? Styling.Colors.green : Styling.Colors.white }}>
				{children}
			</StyledText>
		</View>
	);
};

export default StyledButton;

const styles = StyleSheet.create({
	button: {
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
		alignSelf: "center",
		alignItems: "center",
		borderRadius: Styling.BorderRadius.reg,
	},
});
