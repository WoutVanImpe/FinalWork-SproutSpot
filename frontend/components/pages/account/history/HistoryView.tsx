import { Image, ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import AccountHeader from "../header/AccountHeader";
import Spacer from "../../../style/Spacer";

export interface HistoryEntry {
	id: string;
	date: string;
	time: string;
	event: string;
	image?: number;
}

interface HistoryViewProps {
	entries: HistoryEntry[];
	onBack: () => void;
}

const groupByDate = (entries: HistoryEntry[]) => {
	const groups: { date: string; entries: HistoryEntry[] }[] = [];
	const map = new Map<string, HistoryEntry[]>();
	for (const entry of entries) {
		const list = map.get(entry.date);
		if (list) {
			list.push(entry);
		} else {
			map.set(entry.date, [entry]);
		}
	}
	for (const [date, entries] of map) {
		groups.push({ date, entries });
	}
	return groups.sort((a, b) => {
		const [da, ma] = a.date.split("/").map(Number);
		const [db, mb] = b.date.split("/").map(Number);
		return mb - ma || db - da;
	});
};

const HistoryView = ({ entries, onBack }: HistoryViewProps) => {
	const groups = groupByDate(entries);

	return (
		<StyledView>
			<AccountHeader title="Historiek" onBack={onBack} />
			<Spacer space={Styling.Spacing.med} />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{groups.map((group) => (
					<View key={group.date}>
						<StyledText type="head3" style={styles.dateHeader}>
							{group.date}
						</StyledText>
						{group.entries.map((entry) => (
							<View key={entry.id} style={styles.historyRow}>
								<StyledText type="smParagh" style={styles.historyTime}>
									{entry.time}
								</StyledText>
								{entry.image && (
									<Image source={entry.image} style={styles.plantThumb} resizeMode="contain" />
								)}
								<StyledText type="paragh" style={styles.historyEvent}>
									{entry.event}
								</StyledText>
							</View>
						))}
						<Spacer space={Styling.Spacing.med} />
					</View>
				))}
			</ScrollView>
		</StyledView>
	);
};

export default HistoryView;

const styles = StyleSheet.create({
	scrollContent: {
		paddingTop: Styling.Padding.sml,
		width: "100%",
		padding: 0,
		paddingBottom: 120,
	},
	dateHeader: {
		color: Styling.Colors.white,
	},
	historyRow: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: Styling.Padding.sml,
		borderBottomWidth: 1,
		borderBottomColor: Styling.Colors.lightGrey,
		gap: Styling.Spacing.sml,
	},
	plantThumb: {
		width: 36,
		height: 36,
		borderRadius: Styling.BorderRadius.sml,
		marginRight: Styling.Spacing.sml,
	},
	historyTime: {
		color: Styling.Colors.green,
		width: 50,
	},
	historyEvent: {
		color: Styling.Colors.white,
		flex: 1,
	},
});
