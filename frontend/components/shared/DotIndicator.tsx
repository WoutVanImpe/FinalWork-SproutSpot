import { StyleSheet, View } from "react-native";
import React from "react";
import { Styling } from "../../constants/Styling";
import { scaled } from "../../constants/scale";

const Dot = ({ active }: { active: boolean }) => (
	<View style={[styles.dot, { backgroundColor: active ? Styling.Colors.green : "rgba(255,255,255,0.4)" }]} />
);

const DotIndicator = ({ count, activeIndex }: { count: number; activeIndex: number }) => (
	<View style={styles.container}>
		{Array.from({ length: count }, (_, i) => (
			<Dot key={i} active={i === activeIndex} />
		))}
	</View>
);

export default DotIndicator;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: Styling.Spacing.sml,
	},
	dot: {
		width: scaled(8),
		height: scaled(8),
		borderRadius: scaled(4),
	},
});


