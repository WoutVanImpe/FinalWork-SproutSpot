import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { Styling } from "../../constants/Styling";
import React, { ReactNode, useRef, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { BAR_MARGIN } from "../../constants/tabConfig";
import { ScrollContext } from "../../context/ScrollContext";

const StyledView = ({ style, children, ...props }: { style?: ViewStyle | ViewStyle[]; safe?: boolean; children?: ReactNode }) => {
	const insets = useSafeAreaInsets();
	const scrollRef = useRef<ScrollView>(null);

	const scrollTo = useCallback((y: number, animated = true) => {
		scrollRef.current?.scrollTo({ y, animated });
	}, []);

	useFocusEffect(
		useCallback(() => {
			scrollRef.current?.scrollTo({ y: 0, animated: false });
		}, [])
	);

	return (
		<ScrollView
			ref={scrollRef}
			style={[styles.base, { paddingTop: 110, paddingBottom: insets.bottom }, style]}
			contentContainerStyle={styles.content}
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
			{...props}
		>
			<ScrollContext.Provider value={{ scrollTo }}>
				<View style={styles.contentPadding}>
					{children}
				</View>
			</ScrollContext.Provider>
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
		alignItems: "stretch",
		justifyContent: "flex-start",
	},
	contentPadding: {
		paddingHorizontal: BAR_MARGIN,
	},
});
