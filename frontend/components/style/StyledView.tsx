import { StyleSheet, View, ViewStyle } from "react-native";
import { Styling } from "../../constants/Styling";
import React, { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BAR_MARGIN } from "../../constants/tabConfig";

const StyledView = ({ style, safe = false, children, ...props }: { style?: ViewStyle; safe?: boolean; children?: ReactNode }) => {
	const insets = useSafeAreaInsets();
	
	if (!safe)
		return (
			<View style={[styles.view, style]} {...props}>
				{children}
			</View>
		);

	return (
		<View style={[styles.view, { paddingBottom: insets.bottom }, style]} {...props}>
			{children}
		</View>
	);
};

export default StyledView;

const styles = StyleSheet.create({
	view: {
		backgroundColor: Styling.Colors.gradGrey,
		paddingTop:	110,
		paddingHorizontal: BAR_MARGIN,
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-start",
	},
});
