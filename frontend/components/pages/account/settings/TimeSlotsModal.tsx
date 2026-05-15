import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledAlert from "../../../style/StyledAlert";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";

interface TimeSlotsModalProps {
	visible: boolean;
	draftHours: number[];
	onToggleHour: (hour: number) => void;
	onSave: () => void;
	onDismiss: () => void;
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0") + ":00");

const TimeSlotsModal = ({ visible, draftHours, onToggleHour, onSave, onDismiss }: TimeSlotsModalProps) => (
	<StyledAlert
		visible={visible}
		title="Tijdsvensters"
		titleAlign="left"
		onDismiss={onDismiss}
		buttons={[{ text: "Opslaan", style: "default", onPress: onSave }]}
	>
		<Spacer space={Styling.Spacing.reg} />
		<View style={styles.hourGrid}>
			{HOUR_LABELS.map((label, h) => (
				<TouchableOpacity
					key={h}
					style={[styles.hourBtn, draftHours.includes(h) && styles.hourBtnActive]}
					onPress={() => onToggleHour(h)}
				>
					<StyledText type="smParagh" style={draftHours.includes(h) ? styles.hourTextActive : styles.hourText}>
						{label}
					</StyledText>
				</TouchableOpacity>
			))}
		</View>
		<Spacer space={Styling.Spacing.reg} />
	</StyledAlert>
);

export default TimeSlotsModal;

export function formatActiveHours(hours: number[]): string {
	if (hours.length === 0) return "Geen";
	const sorted = [...hours].sort((a, b) => a - b);
	const ranges: { start: number; end: number }[] = [];
	let i = 0;
	while (i < sorted.length) {
		const start = sorted[i];
		let end = start;
		while (i + 1 < sorted.length && sorted[i + 1] === end + 1) {
			end = sorted[i + 1];
			i++;
		}
		ranges.push({ start, end });
		i++;
	}
	const pad = (n: number) => String(n).padStart(2, "0");
	const first = `${pad(ranges[0].start)}:00-${pad(ranges[0].end)}:00`;
	if (ranges.length <= 1) return first;
	return `${first} +${ranges.length - 1}`;
}

const styles = StyleSheet.create({
	hourGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Styling.Spacing.sml,
		justifyContent: "center",
	},
	hourBtn: {
		width: 56,
		height: 36,
		borderRadius: Styling.BorderRadius.reg,
		backgroundColor: "#e8e8e8",
		justifyContent: "center",
		alignItems: "center",
	},
	hourBtnActive: {
		backgroundColor: Styling.Colors.green,
	},
	hourText: {
		color: Styling.Colors.black,
	},
	hourTextActive: {
		color: Styling.Colors.white,
	},
});
