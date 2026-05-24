import { StyleSheet, View } from "react-native";
import React from "react";
import Svg, { Path } from "react-native-svg";
import { Styling } from "../../../constants/Styling";
import { BAR_HEIGHT, CORNER_RADIUS, SCOOP_RADIUS, SCOOP_DEPTH } from "../../../constants/tabConfig";

const CurvedBackground = ({ width, cx }: { width: number; cx: number }) => {
	const r = SCOOP_RADIUS;
	const d = SCOOP_DEPTH;
	const s = 16;
	const v = 4;

	const path = [
		`M ${CORNER_RADIUS} 0`,
		`L ${cx - r - s} 0`,
		`C ${cx - r - s + 10} 0, ${cx - r} 0, ${cx - r} ${v}`,
		`C ${cx - r} ${d}, ${cx + r} ${d}, ${cx + r} ${v}`,
		`C ${cx + r} 0, ${cx + r + s - 10} 0, ${cx + r + s} 0`,
		`L ${width - CORNER_RADIUS} 0`,
		`Q ${width} 0, ${width} ${CORNER_RADIUS}`,
		`L ${width} ${BAR_HEIGHT - CORNER_RADIUS}`,
		`Q ${width} ${BAR_HEIGHT}, ${width - CORNER_RADIUS} ${BAR_HEIGHT}`,
		`L ${CORNER_RADIUS} ${BAR_HEIGHT}`,
		`Q 0 ${BAR_HEIGHT}, 0 ${BAR_HEIGHT - CORNER_RADIUS}`,
		`L 0 ${CORNER_RADIUS}`,
		`Q 0 0, ${CORNER_RADIUS} 0`,
		`Z`,
	].join(" ");

	return (
		<View style={[styles.shadowContainer, { width, height: BAR_HEIGHT }]}>
			<Svg width={width} height={BAR_HEIGHT}>
				<Path d={path} fill={Styling.Colors.white} />
			</Svg>
		</View>
	);
};

export default CurvedBackground;

const styles = StyleSheet.create({
	shadowContainer: {
		borderRadius: CORNER_RADIUS,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
	},
});
