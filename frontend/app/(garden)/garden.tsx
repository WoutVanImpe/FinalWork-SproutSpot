import { PanResponder, StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { CELL, MAX_SCALE, MIN_SCALE, SCALE_STEP, clampOffset, gridDimensions } from "../../constants/garden";
import { Styling } from "../../constants/Styling";
import { BAR_HEIGHT } from "../../constants/tabConfig";
import { getGarden, getDashboard, createUserPlant, updateGarden, enrichedToGardenPlant } from "../../services/garden";
import { pairProbe } from "../../services/probes";
import { getPlantById } from "../../services/plants";
import type { EnrichedPlant } from "../../services/garden";
import type { PlantDetail } from "../../services/plants";
import Spacer from "../../components/style/Spacer";
import StyledText from "../../components/style/StyledText";
import StyledButton from "../../components/style/StyledButton";
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
import { scaled } from "../../constants/scale";

let vegCache: Record<string, PlantDetail> = {};

async function fetchPlantDetail(vegId: string): Promise<PlantDetail | null> {
	if (vegCache[vegId]) return vegCache[vegId];
	try {
		const res = await getPlantById(vegId);
		if (res.data) {
			vegCache[vegId] = res.data;
			return res.data;
		}
	} catch {
		/* ignore */
	}
	return null;
}

const Garden = () => {
	const params = useLocalSearchParams<{ selectedPlantId?: string; placementMode?: string; vegId?: string; name?: string; probeId?: string }>();
	const [plants, setPlants] = useState<GardenPlant[]>([]);
	const [loading, setLoading] = useState(true);
	const [gardenId, setGardenId] = useState<number | null>(null);
	const [cols, setCols] = useState(3);
	const [rows, setRows] = useState(3);
	const [isEditing, setIsEditing] = useState(false);
	const [isPlacing, setIsPlacing] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
	const [isMoving, setIsMoving] = useState(false);
	const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
	const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; buttons?: AlertButton[] } | null>(null);
	const isEditingRef = useRef(false);

	useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);

	useFocusEffect(
		useCallback(() => {
			setLoading(true);
			getGarden()
				.then((res) => {
					if (res.data) {
						setPlants(res.data.plants.map(enrichedToGardenPlant));
						setGardenId(res.data.garden.id);
						setCols(res.data.garden.width);
						setRows(res.data.garden.height);
					}
				})
				.catch(console.error)
				.finally(() => setLoading(false));

			const interval = setInterval(() => {
				if (isEditingRef.current) return;
				getGarden()
					.then((res) => {
						if (res.data) {
							setPlants(res.data.plants.map(enrichedToGardenPlant));
							setGardenId(res.data.garden.id);
							setCols(res.data.garden.width);
							setRows(res.data.garden.height);
						}
					})
					.catch(console.error);
			}, 15000);
			return () => clearInterval(interval);
		}, []),
	);

	useEffect(() => {
		if (params.selectedPlantId) {
			const plant = plants.find((p) => p.id === params.selectedPlantId);
			if (plant) {
				setSelectedPlant(plant);
			}
		}
		if (params.placementMode === "true" && params.vegId) {
			setIsPlacing(true);
		}
	}, [params.selectedPlantId, params.placementMode, params.vegId, params.probeId]);

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
		setOffset((prevOffset) => {
			const ratio = newScale / prevScale;
			return clampOffset(
				{
					x: prevOffset.x * ratio + (vw / 2 - cx) * (1 - ratio),
					y: prevOffset.y * ratio + (vh / 2 - cy) * (1 - ratio),
				},
				newScale,
				vw,
				vh,
				w,
				h,
			);
		});
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
						onPress: async () => {
							try {
								await updateGarden({
									width: cols,
									height: rows,
									plant_positions: plants.map((p) => ({ id: p.id.replace("veg_", ""), x: p.x, y: p.y })),
								});
							} catch (err) {
								console.error(err);
							}
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

	if (loading) {
		return (
			<View style={[styles.page, { justifyContent: "center", alignItems: "center" }]}>
				<ActivityIndicator color={Styling.Colors.green} size="large" />
			</View>
		);
	}

	if (plants.length === 0 && !isPlacing) {
		return (
			<View style={[styles.page, { alignItems: "center" }]}>
				<Spacer space={scaled(230)} />
				<StyledText type="head3" style={{ textAlign: "center" }}>
					Je tuin is nog leeg
				</StyledText>
				<Spacer space={Styling.Spacing.med} />
				<StyledText type="paragh" style={{ textAlign: "center", color: Styling.Colors.white }}>
					Voeg planten toe om je tuin tot leven te brengen
				</StyledText>
				<Spacer space={Styling.Spacing.lrg} />
				<TouchableOpacity onPress={() => router.push("/(explore)/explore")}>
					<StyledButton>Planten ontdekken</StyledButton>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<>
			<View style={styles.page}>
				<Spacer space={scaled(110)} />

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
				) : isPlacing ? (
					<>
						<View style={styles.placementBar}>
							<StyledText type="head3" style={styles.placementTitle}>
								Kies een plek voor {decodeURIComponent(params.name || "")}
							</StyledText>
							<TouchableOpacity
								onPress={() => {
									setIsPlacing(false);
									router.setParams({ placementMode: undefined, vegId: undefined, name: undefined });
								}}
							>
								<StyledText type="paragh" style={{ color: Styling.Colors.green }}>
									Annuleren
								</StyledText>
							</TouchableOpacity>
						</View>
						<Spacer space={Styling.Spacing.reg} />
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
							setOffset({
								x: (width - w) / 2,
								y: (height - h) / 2,
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
								width: GRID_W,
								height: GRID_H,
								transform: [{ translateX: offset.x }, { translateY: offset.y }, { scale }],
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
										onPress={async () => {
											if (isEditing) {
												selectCell(cx, cy);
											} else if (isPlacing) {
												if (!plant && params.vegId) {
													const veg = await fetchPlantDetail(params.vegId);
													const numericId = params.vegId.replace("veg_", "");
													try {
														const created = await createUserPlant({ plant_id: numericId, nickname: decodeURIComponent(params.name || veg?.name || ""), x_pos: cx, y_pos: cy, garden_id: gardenId ?? undefined });
														if (params.probeId && created.data?.id) {
															await pairProbe(Number(params.probeId), created.data.id).catch(console.error);
															setAlertConfig({
																title: "Sonde gekoppeld",
																message: "Druk nu kort op de knop van de sonde om te synchroniseren.",
															});
														}
														const res = await getGarden();
														if (res.data) {
															setPlants(res.data.plants.map(enrichedToGardenPlant));
														}
													} catch (err) {
														console.error(err);
													}
													setIsPlacing(false);
													router.setParams({ placementMode: undefined, vegId: undefined, name: undefined, probeId: undefined });
												}
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
			<PlantSheet
				plant={selectedPlant}
				isVisible={selectedPlant !== null}
				onClose={() => {
					setSelectedPlant(null);
					router.setParams({ selectedPlantId: undefined });
				}}
			/>
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
	placementBar: {
		paddingHorizontal: Styling.Padding.reg,
		alignItems: "center",
		gap: Styling.Spacing.sml,
	},
	placementTitle: {
		color: Styling.Colors.white,
		textAlign: "center",
	},
});
