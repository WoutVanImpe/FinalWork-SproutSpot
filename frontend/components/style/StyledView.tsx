import { StyleSheet, View, ViewStyle } from "react-native";
import { Styling } from "../../constants/Styling";
import React, { ReactNode } from "react";

const StyledView = ({ style, children, ...props }: { style?: ViewStyle; children?: ReactNode }) => {
	return (
		<View style={[styles.view, style]} {...props}>
			{children}
		</View>
	);
};

export default StyledView;

const styles = StyleSheet.create({
	view: {
		backgroundColor: Styling.Colors.gradGrey,
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-start",
	},
});
