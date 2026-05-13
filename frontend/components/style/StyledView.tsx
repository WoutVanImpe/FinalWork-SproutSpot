import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { Styling } from "../../constants/Styling";
import React, { ReactNode, useRef, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { BAR_MARGIN } from "../../constants/tabConfig";

const StyledView = ({ style, safe = false, children, ...props }: { style?: ViewStyle; safe?: boolean; children?: ReactNode }) => {
	const insets = useSafeAreaInsets();
	const scrollRef = useRef<ScrollView>(null);

	useFocusEffect(
		useCallback(() => {
			scrollRef.current?.scrollTo({ y: 0, animated: false });
		}, [])
	);

	if (!safe)
		return (
			<View style={[styles.base, style]} {...props}>
				{children}
			</View>
		);

	return (
		<ScrollView
			ref={scrollRef}
			style={[styles.base, { paddingBottom: insets.bottom }, style]}
			contentContainerStyle={styles.content}
			{...props}
		>
			<View style={styles.contentPadding}>
				{children}
			</View>
		</ScrollView>
	);
};

export default StyledView;

const styles = StyleSheet.create({
	base: {
		backgroundColor: Styling.Colors.gradGrey,
		flex: 1,
	},
	content: {
		alignItems: "center",
		justifyContent: "flex-start",
	},
	contentPadding: {
		paddingTop: 110,
		paddingHorizontal: BAR_MARGIN,
	},
});
