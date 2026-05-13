import { Dimensions, PanResponder, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import StyledIcon from "../../components/style/StyledIcon";
import StyledText from "../../components/style/StyledText";
import GardenGridItem, { GardenPlant } from "../../components/pages/garden/gardenGrid/GardenGridItem";
import ZoomInIcon from "../../assets/icons/zoom_in.svg";
import ZoomOutIcon from "../../assets/icons/zoom_out.svg";
import { Styling } from "../../constants/Styling";
import { BAR_HEIGHT, BAR_MARGIN } from "../../constants/tabConfig";
import Spacer from "../../components/style/Spacer";
import PlantSheet from "../../components/pages/garden/plantSheet/PlantSheet";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLS = 5;
const ROWS = 6;
const CELL = 80;
const GRID_W = COLS * CELL;
const GRID_H = ROWS * CELL;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.2;

function clampOffset(desired: { x: number; y: number }, scale: number, vw: number, vh: number): { x: number; y: number } {
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
	{
		id: "1",
		image: require("../../assets/vegetables/tomato.png"),
		warning: false,
		x: 0,
		y: 0,
		nickname: "Tomaat Toby",
		stage: { current: 3, max: 4, label: "Groeispurt" },
		water: { level: 20, label: "Staat droog", optimalMin: 40, optimalMax: 80 },
		light: { level: 65, label: "Halfschaduw", optimalMin: 30, optimalMax: 70 },
		temperature: { level: 55, label: "Aangenaam", optimalMin: 40, optimalMax: 75 },
		advice: "Tomaat Toby maakt nu veel blad aan en verbruikt extra water. Geef die een flinke scheut.",
		battery: 76,
	},
	{
		id: "2",
		image: require("../../assets/vegetables/cabbage.png"),
		warning: true,
		x: 2,
		y: 0,
		nickname: "Kool Karel",
		stage: { current: 2, max: 4, label: "Bladachtig" },
		water: { level: 85, label: "Kletsnat", optimalMin: 30, optimalMax: 70 },
		light: { level: 90, label: "Veel zon", optimalMin: 40, optimalMax: 80 },
		temperature: { level: 50, label: "Aangenaam", optimalMin: 35, optimalMax: 70 },
		advice: "Kool Karel heeft te veel water gehad. Laat de grond eerst opdrogen voor je weer water geeft.",
		battery: 42,
	},
	{
		id: "3",
		image: require("../../assets/vegetables/tomato.png"),
		warning: false,
		x: 4,
		y: 1,
		nickname: "Tomaat Tessa",
		stage: { current: 1, max: 4, label: "Kiemvorming" },
		water: { level: 50, label: "Perfect", optimalMin: 40, optimalMax: 80 },
		light: { level: 45, label: "Halfschaduw", optimalMin: 30, optimalMax: 70 },
		temperature: { level: 60, label: "Warm", optimalMin: 40, optimalMax: 75 },
		advice: "Tessa ontkiemt goed! Blijf de grond licht vochtig houden en bescherm tegen felle middagzon.",
		battery: 91,
	},
	{
		id: "4",
		image: require("../../assets/vegetables/cabbage.png"),
		warning: true,
		x: 1,
		y: 2,
		nickname: "Kool Kim",
		stage: { current: 3, max: 4, label: "Groeispurt" },
		water: { level: 15, label: "Droogtegevaar", optimalMin: 30, optimalMax: 70 },
		light: { level: 80, label: "Veel zon", optimalMin: 40, optimalMax: 80 },
		temperature: { level: 35, label: "Koel", optimalMin: 35, optimalMax: 70 },
		advice: "Kool Kim heeft dringend water nodig! De grond is te droog voor deze groeifase.",
		battery: 23,
	},
	{
		id: "5",
		image: require("../../assets/vegetables/tomato.png"),
		warning: false,
		x: 3,
		y: 3,
		nickname: "Tomaat Tim",
		stage: { current: 4, max: 4, label: "Oogstklaar" },
		water: { level: 70, label: "Vochtig", optimalMin: 40, optimalMax: 80 },
		light: { level: 85, label: "Volle zon", optimalMin: 40, optimalMax: 80 },
		temperature: { level: 70, label: "Warm", optimalMin: 40, optimalMax: 75 },
		advice: "Tim is klaar om geoogst te worden! De tomaten zijn rijp en sappig.",
		battery: 58,
	},
	{
		id: "6",
		image: require("../../assets/vegetables/cabbage.png"),
		warning: false,
		x: 0,
		y: 4,
		nickname: "Kool Lisa",
		stage: { current: 2, max: 4, label: "Bladachtig" },
		water: { level: 45, label: "Vochtig", optimalMin: 30, optimalMax: 70 },
		light: { level: 55, label: "Halfschaduw", optimalMin: 30, optimalMax: 70 },
		temperature: { level: 45, label: "Aangenaam", optimalMin: 35, optimalMax: 70 },
		advice: "Lisa groeit gestaag. Blijf de grond gelijkmatig vochtig houden.",
		battery: 67,
	},
	{
		id: "7",
		image: require("../../assets/vegetables/tomato.png"),
		warning: true,
		x: 2,
		y: 4,
		nickname: "Tomaat Pip",
		stage: { current: 2, max: 4, label: "Bloei" },
		water: { level: 95, label: "Te nat", optimalMin: 40, optimalMax: 80 },
		light: { level: 30, label: "Te donker", optimalMin: 30, optimalMax: 70 },
		temperature: { level: 75, label: "Te warm", optimalMin: 40, optimalMax: 75 },
		advice: "Pip heeft het moeilijk. Minder water geven en verplaats naar een lichtere plek.",
		battery: 34,
	},
	{
		id: "8",
		image: require("../../assets/vegetables/cabbage.png"),
		warning: false,
		x: 4,
		y: 5,
		nickname: "Kool Mo",
		stage: { current: 1, max: 4, label: "Kiemvorming" },
		water: { level: 60, label: "Perfect", optimalMin: 30, optimalMax: 70 },
		light: { level: 50, label: "Halfschaduw", optimalMin: 30, optimalMax: 70 },
		temperature: { level: 55, label: "Aangenaam", optimalMin: 35, optimalMax: 70 },
		advice: "Mo komt goed op. Zorg voor voldoende licht en bescherm tegen slakken.",
		battery: 82,
	},
];

const Garden = () => {
	const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
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
				setOffset(clampOffset(desired, scaleRef.current, viewportSizeRef.current.width, viewportSizeRef.current.height));
			},
			onPanResponderRelease: () => {},
		}),
	).current;

	const zoom = (dir: "in" | "out") => {
		const prevScale = scaleRef.current;
		const newScale = dir === "in" ? Math.min(MAX_SCALE, Math.round((prevScale + SCALE_STEP) * 10) / 10) : Math.max(MIN_SCALE, Math.round((prevScale - SCALE_STEP) * 10) / 10);
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
		<>
			<View style={styles.page}>
				<Spacer space={Styling.Spacing.xxl} />
				<View style={styles.controlBar}>
					<TouchableOpacity style={styles.editBtn}>
						<StyledText type="head4" style={styles.editBtnText}>
							Bewerken
						</StyledText>
					</TouchableOpacity>
					<TouchableOpacity style={styles.zoomBtn} onPress={() => zoom("out")}>
						<StyledIcon Icon={ZoomOutIcon} size="reg" fill={Styling.Colors.white} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.zoomBtn} onPress={() => zoom("in")}>
						<StyledIcon Icon={ZoomInIcon} size="reg" fill={Styling.Colors.white} />
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
								transform: [{ scale }, { translateX: offset.x }, { translateY: offset.y }],
							},
						]}
					>
						<View style={{ width: GRID_W, height: GRID_H }}>
							{cells.map(({ cx, cy }) => {
								const key = `${cx}-${cy}`;
								const plant = plantMap.get(key);
								return (
									<View key={key} style={[styles.cell, { left: cx * CELL, top: cy * CELL }]}>
										{plant && <GardenGridItem plant={plant} onPress={() => setSelectedPlant(plant)} />}
									</View>
								);
							})}
						</View>
					</View>
				</View>
			</View>
			<PlantSheet plant={selectedPlant} isVisible={selectedPlant !== null} onClose={() => setSelectedPlant(null)} />
		</>
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
		width: 150,
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
		marginRight: "auto",
	},
	editBtnText: {
		color: Styling.Colors.white,
	},
	zoomBtn: {
		aspectRatio: 1,
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.sml,
		borderRadius: Styling.BorderRadius.reg,
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

		alignItems: "center",
		justifyContent: "center",
	},
});
