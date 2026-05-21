import { Modal, StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import React, { useState, useMemo } from "react";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { Styling } from "../../../../constants/Styling";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import CloseIcon from "../../../../assets/icons/close.svg";
import Spacer from "../../../style/Spacer";
import type { ReadingRecord } from "../../../../services/garden";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_PADDING = 40;
const CHART_W = SCREEN_WIDTH - 80 - CHART_PADDING * 2;
const CHART_H = 150;
const GRAPH_PAD = { top: 12, bottom: 20, left: 35, right: 15 };

interface DataPoint {
	value: number;
	label: string;
}

interface MetricConfig {
	key: string;
	label: string;
	unit: string;
	optimalMin: number;
	optimalMax: number;
	data: DataPoint[];
	yMax: number;
	color: string;
}

interface GraphModalProps {
	visible: boolean;
	onDismiss: () => void;
	readings: ReadingRecord[];
	optimalRanges: {
		water: { optimalMin: number; optimalMax: number };
		light: { optimalMin: number; optimalMax: number };
		temperature: { optimalMin: number; optimalMax: number };
	};
}

const toX = (i: number, total: number) => GRAPH_PAD.left + (i / (total - 1)) * CHART_W;
const toY = (value: number, yMax: number) => GRAPH_PAD.top + CHART_H - (value / yMax) * (CHART_H - GRAPH_PAD.top - GRAPH_PAD.bottom);

function formatLabel(iso: string): string {
	const d = new Date(iso);
	return String(d.getHours()).padStart(2, "0") + ":00";
}

function getDataLabel(iso: string, index: number, total: number): string {
	if (total <= 5) return formatLabel(iso);
	const step = Math.max(1, Math.floor((total - 1) / 4));
	if (index % step === 0 || index === total - 1) return formatLabel(iso);
	return "";
}

function buildMetrics(readings: ReadingRecord[], optimalRanges: GraphModalProps["optimalRanges"]): MetricConfig[] {
	const sorted = [...readings].reverse();
	const dataMap = sorted.map((r) => ({ label: r.created_at, mo: r.soil_moist_pct ?? 0, te: r.temp_c ?? 0, li: r.light_lux ?? 0 }));
	const maxTemp = Math.max(...dataMap.map((d) => d.te), 40);
	const maxLight = Math.max(...dataMap.map((d) => d.li), 50000);
	return [
		{ key: "moist", label: "Vocht", unit: "%", optimalMin: optimalRanges.water.optimalMin, optimalMax: optimalRanges.water.optimalMax, yMax: 100, color: "#4A90D9", data: dataMap.map((d) => ({ value: d.mo, label: d.label })) },
		{ key: "temp", label: "Temperatuur", unit: "°C", optimalMin: optimalRanges.temperature.optimalMin, optimalMax: optimalRanges.temperature.optimalMax, yMax: maxTemp, color: "#C44028", data: dataMap.map((d) => ({ value: d.te, label: d.label })) },
		{ key: "light", label: "Licht", unit: "lux", optimalMin: optimalRanges.light.optimalMin, optimalMax: optimalRanges.light.optimalMax, yMax: maxLight, color: "#F5A623", data: dataMap.map((d) => ({ value: d.li, label: d.label })) },
	];
}

const GraphModal = ({ visible, onDismiss, readings, optimalRanges }: GraphModalProps) => {
	const [selectedMetric, setSelectedMetric] = useState(0);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const METRICS = useMemo(() => buildMetrics(readings, optimalRanges), [readings, optimalRanges]);

	const metric = METRICS[selectedMetric] || METRICS[0];
	const yMax = metric?.yMax ?? 100;
	const points = metric?.data ?? [];

	const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i, points.length)},${toY(p.value, yMax)}`).join(" ");

	const optimalY1 = toY(metric.optimalMax, yMax);
	const optimalY2 = toY(metric.optimalMin, yMax);

	const yLabels: number[] = [];
	const step = yMax / 4;
	for (let i = 0; i <= 4; i++) {
		yLabels.push(Math.round(i * step));
	}

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
			<View style={styles.backdrop}>
				<View style={styles.card}>
					<TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
						<StyledIcon Icon={CloseIcon} size="reg" fill={Styling.Colors.white} />
					</TouchableOpacity>

					<StyledText type="head3" style={styles.title}>
						Grafieken
					</StyledText>
					<Spacer space={Styling.Spacing.med} />

					<View style={styles.dropdownContainer}>
						<TouchableOpacity style={styles.dropdown} onPress={() => setDropdownOpen(!dropdownOpen)}>
							<StyledText type="paragh" style={styles.dropdownText}>
								{metric.label} ({metric.unit})
							</StyledText>
							<StyledText type="paragh" style={styles.dropdownArrow}>
								{dropdownOpen ? "▲" : "▼"}
							</StyledText>
						</TouchableOpacity>

						{dropdownOpen && (
							<View style={styles.dropdownOverlay}>
								{METRICS.map((m, i) => (
									<TouchableOpacity
										key={m.key}
										style={[styles.dropdownItem, i === selectedMetric && styles.dropdownItemActive]}
										onPress={() => {
											setSelectedMetric(i);
											setDropdownOpen(false);
										}}
									>
										<StyledText type="paragh" style={i === selectedMetric ? styles.dropdownItemTextActive : styles.dropdownItemText}>
											{m.label} ({m.unit})
										</StyledText>
									</TouchableOpacity>
								))}
							</View>
						)}
					</View>

					<View style={{ marginTop: -20 }} />

					<View style={styles.chartContainer}>
						<Svg width={CHART_W + GRAPH_PAD.left + GRAPH_PAD.right} height={CHART_H + GRAPH_PAD.top + GRAPH_PAD.bottom}>
							<Rect x={GRAPH_PAD.left} y={optimalY1} width={CHART_W} height={optimalY2 - optimalY1} fill={Styling.Colors.green} opacity={0.12} rx={4} />
							<Line x1={GRAPH_PAD.left} y1={optimalY1} x2={GRAPH_PAD.left + CHART_W} y2={optimalY1} stroke={Styling.Colors.green} strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />
							<Line x1={GRAPH_PAD.left} y1={optimalY2} x2={GRAPH_PAD.left + CHART_W} y2={optimalY2} stroke={Styling.Colors.green} strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />
							{yLabels.map((val) => (
								<React.Fragment key={val}>
									<Line x1={GRAPH_PAD.left} y1={toY(val, yMax)} x2={GRAPH_PAD.left + CHART_W} y2={toY(val, yMax)} stroke="#e8e8e8" strokeWidth={1} />
									<SvgText x={GRAPH_PAD.left - 8} y={toY(val, yMax) + 4} fill={Styling.Colors.lightGrey} fontSize={10} textAnchor="end">
										{val}
									</SvgText>
								</React.Fragment>
							))}
							<Path d={linePath} fill="none" stroke={metric.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
							{points.map((p, i) => (
								<Circle key={i} cx={toX(i, points.length)} cy={toY(p.value, yMax)} r={3} fill={metric.color} />
							))}
							{points
								.filter((_, i) => i % Math.max(1, Math.floor(points.length / 4)) === 0 || i === points.length - 1)
								.map((p, i) => (
									<SvgText key={i} x={toX(points.indexOf(p), points.length)} y={CHART_H + GRAPH_PAD.top + GRAPH_PAD.bottom - 5} fill={Styling.Colors.lightGrey} fontSize={9} textAnchor="middle">
										{getDataLabel(p.label, points.indexOf(p), points.length)}
									</SvgText>
								))}
						</Svg>
					</View>

					<Spacer space={Styling.Spacing.sml} />
					<View style={styles.legend}>
						<View style={styles.legendRow}>
							<View style={[styles.legendDot, { backgroundColor: metric.color }]} />
							<StyledText type="smParagh" style={styles.legendText}>
								Meting
							</StyledText>
						</View>
						<View style={styles.legendRow}>
							<View style={[styles.legendBar, { backgroundColor: Styling.Colors.green, opacity: 0.4 }]} />
							<StyledText type="smParagh" style={styles.legendText}>
								Optimaal ({metric.optimalMin}-{metric.optimalMax} {metric.unit})
							</StyledText>
						</View>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default GraphModal;

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	card: {
		backgroundColor: Styling.Colors.white,
		borderRadius: 20,
		paddingHorizontal: 25,
		paddingVertical: Styling.Padding.lrg,
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
	},
	closeBtn: {
		position: "absolute",
		top: Styling.Padding.reg,
		right: Styling.Padding.reg,
		zIndex: 1,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: Styling.Colors.green,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		color: Styling.Colors.green,
		textAlign: "center",
	},
	dropdownContainer: {
		position: "relative",
		zIndex: 10,
	},
	dropdown: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: Styling.Colors.green,
		borderRadius: Styling.BorderRadius.reg,
		paddingHorizontal: Styling.Padding.reg,
		paddingVertical: Styling.Padding.sml,
		minHeight: 40,
	},
	dropdownText: {
		color: Styling.Colors.darkGrey,
		textAlign: "center",
	},
	dropdownArrow: {
		color: Styling.Colors.green,
		position: "absolute",
		right: Styling.Padding.reg,
	},
	dropdownOverlay: {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		borderWidth: 1,
		borderColor: Styling.Colors.green,
		borderRadius: Styling.BorderRadius.reg,
		marginTop: Styling.Spacing.xsm,
		overflow: "hidden",
		backgroundColor: Styling.Colors.white,
	},
	dropdownItem: {
		paddingHorizontal: Styling.Padding.reg,
		paddingVertical: Styling.Padding.sml,
	},
	dropdownItemActive: {
		backgroundColor: Styling.Colors.green,
	},
	dropdownItemText: {
		color: Styling.Colors.darkGrey,
		textAlign: "center",
	},
	dropdownItemTextActive: {
		color: Styling.Colors.white,
		textAlign: "center",
	},
	chartContainer: {
		alignItems: "center",
	},
	legend: {
		flexDirection: "row",
		justifyContent: "center",
		gap: Styling.Spacing.med,
		flexWrap: "wrap",
	},
	legendRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Styling.Spacing.xsm,
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	legendBar: {
		width: 16,
		height: 8,
		borderRadius: 2,
	},
	legendText: {
		color: Styling.Colors.darkGrey,
	},
});
