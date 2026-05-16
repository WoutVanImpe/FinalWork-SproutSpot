import { PanResponder, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { CELL, MAX_SCALE, MIN_SCALE, SCALE_STEP, clampOffset, gridDimensions } from "../../constants/garden";
import { Styling } from "../../constants/Styling";
import { BAR_HEIGHT } from "../../constants/tabConfig";
import { initialPlants } from "../../data/gardenPlants";
import Spacer from "../../components/style/Spacer";
import PlantSheet from "../../components/pages/garden/plantSheet/PlantSheet";
import EditTopBar from "../../components/pages/garden/editMode/EditTopBar";
import LayoutControls from "../../components/pages/garden/editMode/LayoutControls";
import ViewTopBar from "../../components/pages/garden/gardenGrid/ViewTopBar";
import SelectionInfo from "../../components/pages/garden/editMode/SelectionInfo";
import EditActionSheet from "../../components/pages/garden/editMode/EditActionSheet";
import GardenGridItem, { GardenPlant } from "../../components/pages/garden/gardenGrid/GardenGridItem";
import { useOverlay } from "../../context/OverlayContext";
import StyledAlert, { AlertButton } from "../../components/style/StyledAlert";
import { useLocalSearchParams, router } from "expo-router";

const Garden = () => {
	const params = useLocalSearchParams<{ selectedPlantId?: string }>();
	const [plants, setPlants] = useState<GardenPlant[]>(initialPlants);
	const [cols, setCols] = useState(5);
	const [rows, setRows] = useState(6);
	const [isEditing, setIsEditing] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
	const [isMoving, setIsMoving] = useState(false);
	const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
	const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; buttons?: AlertButton[] } | null>(null);

	useEffect(() => {
		if (params.selectedPlantId) {
			const plant = plants.find((p) => p.id === params.selectedPlantId);
			if (plant) {
				setSelectedPlant(plant);
			}
		}
	}, [params.selectedPlantId]);

	const [scale, setScale] = useState(1);
	const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
	const [offset, setOffset] = useState({ x: 0, y: 0 });

	const offsetRef = useRef(offset);
	const offsetAtDrag = useRef({ x: 0, y: 0 });
	const scaleRef = useRef(scale);
	const viewportSizeRef = useRef(viewportSize);
	const gridSizeRef = useRef(gridDimensions(cols, rows));
	const editSnapshotRef = useRef<{ plants: GardenPlant[]; cols: number; rows: number } | null>(null);
	const hasCentered = useRef(false);
	const pendingFitRef = useRef(false);

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
		gridSizeRef.current = gridDimensions(cols, rows);
	}, [cols, rows]);

	useEffect(() => {
		if (!hasCentered.current && viewportSize.width > 0 && viewportSize.height > 0) {
			hasCentered.current = true;
			const { w, h } = gridSizeRef.current;
			setOffset({
				x: (viewportSize.width - w) / 2,
				y: (viewportSize.height - h) / 2,
			});
		}
	}, [viewportSize]);

	useEffect(() => {
		if (viewportSize.width > 0 && viewportSize.height > 0) {
			const { w, h } = gridSizeRef.current;
			setOffset((prev) => clampOffset(prev, scale, viewportSize.width, viewportSize.height, w, h));
		}
	}, [scale, viewportSize]);

	useEffect(() => {
		if (viewportSize.width > 0 && viewportSize.height > 0) {
			const { w, h } = gridSizeRef.current;
			setOffset((prev) => clampOffset(prev, scaleRef.current, viewportSize.width, viewportSize.height, w, h));
		}
	}, [cols, rows]);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
			onPanResponderGrant: () => {
				offsetAtDrag.current = { ...offsetRef.current };
			},
			onPanResponderMove: (_, gs) => {
				const { w, h } = gridSizeRef.current;
				const desired = {
					x: offsetAtDrag.current.x + gs.dx,
					y: offsetAtDrag.current.y + gs.dy,
				};
				setOffset(clampOffset(desired, scaleRef.current, viewportSizeRef.current.width, viewportSizeRef.current.height, w, h));
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

		const { w, h } = gridSizeRef.current;
		const cx = w / 2;
		const cy = h / 2;
		const ratio = newScale / prevScale;
		setOffset((prevOffset) =>
			clampOffset(
				{
					x: prevOffset.x * ratio + (vw / 2 - cx) * (1 - ratio),
					y: prevOffset.y * ratio + (vh / 2 - cy) * (1 - ratio),
				},
				newScale,
				vw,
				vh,
				w,
				h,
			),
		);
	};

	const enterEditMode = () => {
		editSnapshotRef.current = { plants: plants.map((p) => ({ ...p })), cols, rows };
		setIsEditing(true);
		setSelectedCell(null);
		setIsMoving(false);
		setHasChanges(false);
		pendingFitRef.current = true;
	};

	const confirmExit = () => {
		if (hasChanges) {
			setAlertConfig({
				title: "Wijzigingen",
				message: "Wil je de wijzigingen opslaan?",
				buttons: [
					{
						text: "Opslaan",
						onPress: () => {
							setIsEditing(false);
							setSelectedCell(null);
							setIsMoving(false);
							setHasChanges(false);
							editSnapshotRef.current = null;
						},
					},
					{
						text: "Niet opslaan",
						style: "destructive",
						onPress: () => {
							if (editSnapshotRef.current) {
								setPlants(editSnapshotRef.current.plants);
								setCols(editSnapshotRef.current.cols);
								setRows(editSnapshotRef.current.rows);
							}
							setIsEditing(false);
							setSelectedCell(null);
							setIsMoving(false);
							setHasChanges(false);
							editSnapshotRef.current = null;
						},
					},
				],
			});
		} else {
			setIsEditing(false);
			setSelectedCell(null);
			setIsMoving(false);
			editSnapshotRef.current = null;
		}
	};

	const selectCell = (x: number, y: number) => {
		if (!isEditing) return;

		if (isMoving && selectedCell) {
			const srcPlant = plants.find((p) => p.x === selectedCell.x && p.y === selectedCell.y);
			const dstPlant = plants.find((p) => p.x === x && p.y === y);

			if (srcPlant) {
				if (dstPlant) {
					setPlants((prev) =>
						prev.map((p) => {
							if (p.id === srcPlant.id) return { ...p, x, y };
							if (p.id === dstPlant.id) return { ...p, x: selectedCell.x, y: selectedCell.y };
							return p;
						}),
					);
				} else {
					setPlants((prev) =>
						prev.map((p) => {
							if (p.id === srcPlant.id) return { ...p, x, y };
							return p;
						}),
					);
				}
				setHasChanges(true);
				setSelectedCell({ x, y });
			}
			setIsMoving(false);
			return;
		}

		if (selectedCell?.x === x && selectedCell?.y === y) {
			setSelectedCell(null);
		} else {
			const cellPlant = plants.find((p) => p.x === x && p.y === y);
			if (cellPlant) {
				setSelectedCell({ x, y });
			} else {
				setSelectedCell(null);
			}
		}
	};

	const deleteSelectedPlant = () => {
		if (!selectedCell) return;
		setPlants((prev) => prev.filter((p) => !(p.x === selectedCell.x && p.y === selectedCell.y)));
		setSelectedCell(null);
		setHasChanges(true);
	};

	const addRow = () => {
		setRows((prev) => prev + 1);
		setHasChanges(true);
	};

	const removeRow = () => {
		if (rows <= 1) {
			setAlertConfig({ title: "Kan rij niet verwijderen", message: "Je tuin moet minstens 1 rij hoog zijn." });
			return;
		}
		if (plants.some((p) => p.y === rows - 1)) {
			setAlertConfig({ title: "Kan rij niet verwijderen", message: "Verwijder eerst de planten in de laatste rij." });
			return;
		}
		setRows((prev) => prev - 1);
		setHasChanges(true);
	};

	const addCol = () => {
		setCols((prev) => prev + 1);
		setHasChanges(true);
	};

	const removeCol = () => {
		if (cols <= 1) {
			setAlertConfig({ title: "Kan kolom niet verwijderen", message: "Je tuin moet minstens 1 kolom breed zijn." });
			return;
		}
		if (plants.some((p) => p.x === cols - 1)) {
			setAlertConfig({ title: "Kan kolom niet verwijderen", message: "Verwijder eerst de planten in de laatste kolom." });
			return;
		}
		setCols((prev) => prev - 1);
		setHasChanges(true);
	};

	const { w: GRID_W, h: GRID_H } = gridDimensions(cols, rows);
	const plantMap = new Map(plants.map((p) => [`${p.x}-${p.y}`, p]));

	const cells: { cx: number; cy: number }[] = [];
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			cells.push({ cx: col, cy: row });
		}
	}

	const isCellSelected = (x: number, y: number) => selectedCell?.x === x && selectedCell?.y === y;
	const selectedEditPlant = selectedCell ? (plantMap.get(`${selectedCell.x}-${selectedCell.y}`) ?? null) : null;

	const { setOverlay } = useOverlay();

	useEffect(() => {
		const showSheet = isEditing && selectedCell !== null && !isMoving;
		if (showSheet && selectedEditPlant) {
			setOverlay(<EditActionSheet plant={selectedEditPlant} isVisible={true} onClose={() => setSelectedCell(null)} onMove={() => setIsMoving(true)} onDelete={deleteSelectedPlant} />);
		} else {
			setOverlay(null);
		}
	}, [isEditing, selectedCell, isMoving, selectedEditPlant]);

	return (
		<>
			<View style={styles.page}>
				<Spacer space={110} />

				{isEditing ? (
					<>
						<EditTopBar onExit={confirmExit} />
						<Spacer space={Styling.Spacing.lrg} />
						<LayoutControls
							onRemoveCol={removeCol}
							onAddCol={addCol}
							onRemoveRow={removeRow}
							onAddRow={addRow}
							onZoomIn={() => zoom("in")}
							onZoomOut={() => zoom("out")}
							canRemoveCol={cols > 1 && !plants.some((p) => p.x === cols - 1)}
							canRemoveRow={rows > 1 && !plants.some((p) => p.y === rows - 1)}
						/>
						<Spacer space={Styling.Spacing.sml} />
					</>
				) : (
					<>
						<ViewTopBar onEdit={enterEditMode} onZoom={zoom} />
						<Spacer space={Styling.Spacing.reg} />
					</>
				)}

				<View
					style={styles.viewportFill}
					onLayout={(e) => {
						const { width, height } = e.nativeEvent.layout;
						if (width > 0 && height > 0) {
							setViewportSize({ width, height });
							if (pendingFitRef.current) {
								pendingFitRef.current = false;
								const { w, h } = gridDimensions(cols, rows);
								const fitScale = Math.max(MIN_SCALE, Math.min(1, Math.min(width / w, height / h)));
								setScale(fitScale);
								const cx = w / 2,
									cy = h / 2;
								const desiredTop = (height - h * fitScale) / 2;
								const desiredLeft = (width - w * fitScale) / 2;
								setOffset({
									x: desiredLeft - cx * (1 - fitScale),
									y: desiredTop - cy * (1 - fitScale),
								});
							}
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
								const selected = isCellSelected(cx, cy);
								return (
									<TouchableOpacity
										key={key}
										style={[styles.cell, { left: cx * CELL, top: cy * CELL }, selected && styles.cellSelected]}
										onPress={() => {
											if (isEditing) {
												selectCell(cx, cy);
											} else if (plant) {
												setSelectedPlant(plant);
											}
										}}
										activeOpacity={0.7}
									>
										{plant && <GardenGridItem plant={plant} />}
										{selected && <View style={styles.selectionOverlay} />}
									</TouchableOpacity>
								);
							})}
						</View>
					</View>
				</View>

				{isEditing && <SelectionInfo isMoving={isMoving} selectedCell={selectedCell} selectedPlantName={selectedEditPlant?.nickname ?? ""} />}

				<Spacer space={BAR_HEIGHT + Styling.Spacing.xlg * 3} />
			</View>
			<PlantSheet plant={selectedPlant} isVisible={selectedPlant !== null} onClose={() => { setSelectedPlant(null); router.setParams({ selectedPlantId: undefined }); }} />
			<StyledAlert visible={alertConfig !== null} title={alertConfig?.title ?? ""} message={alertConfig?.message ?? ""} buttons={alertConfig?.buttons} onDismiss={() => setAlertConfig(null)} />
		</>
	);
};

export default Garden;

const styles = StyleSheet.create({
	page: {
		flex: 1,
		backgroundColor: Styling.Colors.gradGrey,
	},
	viewportFill: {
		flex: 1,
		overflow: "hidden",
		width: "100%",
	},
	gridTransform: {
		position: "absolute",
		top: 0,
		left: 0,
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
	cellSelected: {
		borderWidth: 2,
		borderColor: Styling.Colors.green,
		borderStyle: "solid",
	},
	selectionOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 202, 104, 0.15)",
		borderRadius: 2,
	},
});
