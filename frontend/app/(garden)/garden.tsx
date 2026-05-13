import { Dimensions, PanResponder, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import StyledIcon from "../../components/style/StyledIcon";
import StyledText from "../../components/style/StyledText";
import GardenGridItem, { GardenPlant } from "../../components/shared/gardenGrid/GardenGridItem";
import ZoomInIcon from "../../assets/icons/zoom_in.svg";
import ZoomOutIcon from "../../assets/icons/zoom_out.svg";
import { Styling } from "../../constants/Styling";
import { BAR_HEIGHT, BAR_MARGIN } from "../../constants/tabConfig";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLS = 5;
const ROWS = 6;
const CELL = 80;
const GRID_W = COLS * CELL;
const GRID_H = ROWS * CELL;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.2;

function clampOffset(
	desired: { x: number; y: number },
	scale: number,
	vw: number,
	vh: number,
): { x: number; y: number } {
	const cx = GRID_W / 2;
	const cy = GRID_H / 2;
	const gw = GRID_W * scale;
	const gh = GRID_H * scale;

	const minX = gw <= vw ? vw / 2 - cx : vw - cx * (1 - scale) - GRID_W * scale;
	const maxX = gw <= vw ? vw / 2 - cx : cx * (scale - 1);
	const minY = gh <= vh ? vh / 2 - cy : vh - cy * (1 - scale) - GRID_H * scale;
	const maxY = gh <= vh ? vh / 2 - cy : cy * (scale - 1);

	return {
		x: Math.min(maxX, Math.max(minX, desired.x)),
		y: Math.min(maxY, Math.max(minY, desired.y)),
	};
}

const gardenPlants: GardenPlant[] = [
	{ id: "1", image: require("../../assets/vegetables/tomato.png"), x: 0, y: 0 },
	{ id: "2", image: require("../../assets/vegetables/cabbage.png"), x: 2, y: 0 },
	{ id: "3", image: require("../../assets/vegetables/tomato.png"), x: 4, y: 1 },
	{ id: "4", image: require("../../assets/vegetables/cabbage.png"), x: 1, y: 2 },
	{ id: "5", image: require("../../assets/vegetables/tomato.png"), x: 3, y: 3 },
	{ id: "6", image: require("../../assets/vegetables/cabbage.png"), x: 0, y: 4 },
	{ id: "7", image: require("../../assets/vegetables/tomato.png"), x: 2, y: 4 },
	{ id: "8", image: require("../../assets/vegetables/cabbage.png"), x: 4, y: 5 },
];

const Garden = () => {
	const [scale, setScale] = useState(1);
	const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
	const [offset, setOffset] = useState({
		x: (SCREEN_WIDTH - BAR_MARGIN * 2 - GRID_W) / 2,
		y: (SCREEN_HEIGHT - 160 - GRID_H) / 2,
	});
	const offsetRef = useRef(offset);
	const offsetAtDrag = useRef({ x: 0, y: 0 });
	const scaleRef = useRef(scale);
	const viewportSizeRef = useRef(viewportSize);

	useEffect(() => {
		offsetRef.current = offset;
	}, [offset]);

	useEffect(() => {
		scaleRef.current = scale;
	}, [scale]);

	useEffect(() => {
		viewportSizeRef.current = viewportSize;
	}, [viewportSize]);

	useEffect(() => {
		if (viewportSize.width > 0 && viewportSize.height > 0) {
			setOffset((prev) => clampOffset(prev, scale, viewportSize.width, viewportSize.height));
		}
	}, [scale, viewportSize]);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
			onPanResponderGrant: () => {
				offsetAtDrag.current = { ...offsetRef.current };
			},
			onPanResponderMove: (_, gs) => {
				const desired = {
					x: offsetAtDrag.current.x + gs.dx,
					y: offsetAtDrag.current.y + gs.dy,
				};
				setOffset(
					clampOffset(
						desired,
						scaleRef.current,
						viewportSizeRef.current.width,
						viewportSizeRef.current.height,
					),
				);
			},
			onPanResponderRelease: () => {},
		}),
	).current;

	const zoom = (dir: "in" | "out") => {
		const prevScale = scaleRef.current;
		const newScale =
			dir === "in"
				? Math.min(MAX_SCALE, Math.round((prevScale + SCALE_STEP) * 10) / 10)
				: Math.max(MIN_SCALE, Math.round((prevScale - SCALE_STEP) * 10) / 10);
		if (newScale === prevScale) return;

		setScale(newScale);

		const vw = viewportSizeRef.current.width;
		const vh = viewportSizeRef.current.height;
		if (vw === 0 || vh === 0) return;

		setOffset((prevOffset) => {
			const cx = GRID_W / 2;
			const cy = GRID_H / 2;
			const ratio = newScale / prevScale;
			return clampOffset(
				{
					x: prevOffset.x * ratio + (vw / 2 - cx) * (1 - ratio),
					y: prevOffset.y * ratio + (vh / 2 - cy) * (1 - ratio),
				},
				newScale,
				vw,
				vh,
			);
		});
	};

	const plantMap = new Map(gardenPlants.map((p) => [`${p.x}-${p.y}`, p]));

	const cells: { cx: number; cy: number }[] = [];
	for (let row = 0; row < ROWS; row++) {
		for (let col = 0; col < COLS; col++) {
			cells.push({ cx: col, cy: row });
		}
	}

	return (
		<View style={styles.page}>
			<View style={styles.controlBar}>
				<TouchableOpacity style={styles.editBtn}>
					<StyledText type="head4" style={styles.editBtnText}>Bewerken</StyledText>
				</TouchableOpacity>
				<TouchableOpacity style={styles.zoomBtn} onPress={() => zoom("out")}>
					<StyledIcon Icon={ZoomOutIcon} size="sml" fill={Styling.Colors.white} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.zoomBtn} onPress={() => zoom("in")}>
					<StyledIcon Icon={ZoomInIcon} size="sml" fill={Styling.Colors.white} />
				</TouchableOpacity>
			</View>

			<View
				style={styles.viewport}
				onLayout={(e) => {
					const { width, height } = e.nativeEvent.layout;
					if (width > 0 && height > 0) {
						setViewportSize({ width, height });
					}
				}}
				{...panResponder.panHandlers}
			>
				<View
					style={[
						styles.gridTransform,
						{
							transform: [
								{ scale },
								{ translateX: offset.x },
								{ translateY: offset.y },
							],
						},
					]}
				>
					<View style={{ width: GRID_W, height: GRID_H }}>
						{cells.map(({ cx, cy }) => {
							const key = `${cx}-${cy}`;
							const plant = plantMap.get(key);
							return (
								<View
									key={key}
									style={[
										styles.cell,
										{ left: cx * CELL, top: cy * CELL },
									]}
								>
									{plant && <GardenGridItem plant={plant} />}
								</View>
							);
						})}
					</View>
				</View>
			</View>
		</View>
	);
};

export default Garden;

const styles = StyleSheet.create({
	page: {
		flex: 1,
		backgroundColor: Styling.Colors.gradGrey,
		paddingTop: 110,
		paddingBottom: BAR_HEIGHT + 65,
	},
	controlBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: Styling.Spacing.sml,
		marginBottom: Styling.Spacing.reg,
		paddingHorizontal: BAR_MARGIN,
		width: "100%",
	},
	editBtn: {
		flex: 1,
		backgroundColor: Styling.Colors.lightGrey,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
	},
	editBtnText: {
		color: Styling.Colors.white,
	},
	zoomBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: Styling.Colors.green,
		alignItems: "center",
		justifyContent: "center",
	},
	viewport: {
		flex: 1,
		overflow: "hidden",
		width: "100%",
	},
	gridTransform: {
		position: "absolute",
	},
	cell: {
		position: "absolute",
		width: CELL,
		height: CELL,
		borderWidth: 1,
		borderColor: Styling.Colors.green,
		borderStyle: "dashed",
	},
});
