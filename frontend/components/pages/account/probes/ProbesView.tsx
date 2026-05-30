import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import AccountHeader from "../header/AccountHeader";
import Spacer from "../../../style/Spacer";
import { getUserProbes, ProbeInfo } from "../../../../services/probes";

const stateColors: Record<string, string> = {
	paired: Styling.Colors.green,
	available: "#f0a030",
	offline: Styling.Colors.red,
};

const stateLabels: Record<string, string> = {
	paired: "Gekoppeld",
	available: "Beschikbaar",
	offline: "Offline",
	unregistered: "Onbekend",
};

interface ProbesViewProps {
	onBack: () => void;
}

const ProbesView = ({ onBack }: ProbesViewProps) => {
	const [probes, setProbes] = useState<ProbeInfo[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getUserProbes()
			.then((res) => {
				if (res.data) setProbes(res.data);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	return (
		<StyledView safe={false}>
			<AccountHeader title="Mijn sondes" onBack={onBack} />
			<Spacer space={Styling.Spacing.lrg} />
			<View style={styles.content}>
				{loading ? (
					<ActivityIndicator color={Styling.Colors.green} size="large" style={{ marginTop: 40 }} />
				) : probes.length === 0 ? (
					<StyledText type="paragh" style={styles.emptyText}>Je hebt nog geen sondes.</StyledText>
				) : (
					probes.map((probe) => (
						<View key={probe.id} style={styles.card}>
							<View style={styles.cardHeader}>
								<StyledText type="head4" style={styles.probeName}>{probe.name}</StyledText>
								<View style={[styles.stateBadge, { backgroundColor: stateColors[probe.state] || Styling.Colors.lightGrey }]}>
									<StyledText type="smParagh" style={styles.stateText}>
										{probe.is_charging ? "Opladen" : (stateLabels[probe.state] || probe.state)}
									</StyledText>
								</View>
							</View>
							<Spacer space={Styling.Spacing.sml} />
							<View style={styles.detailRow}>
								<StyledText type="smParagh" style={styles.label}>Batterij:</StyledText>
								<StyledText type="smParagh" style={[styles.value, probe.battery.percentage <= 10 && { color: Styling.Colors.red }]}>
									{probe.battery.percentage}%
								</StyledText>
							</View>
							<View style={styles.detailRow}>
								<StyledText type="smParagh" style={styles.label}>WiFi:</StyledText>
								<StyledText type="smParagh" style={styles.value}>{probe.wifi.quality}</StyledText>
							</View>
							{probe.linked_plant && (
								<View style={styles.detailRow}>
									<StyledText type="smParagh" style={styles.label}>Gekoppeld aan:</StyledText>
									<StyledText type="smParagh" style={[styles.value, { color: Styling.Colors.green }]}>
										{probe.linked_plant.nickname} ({probe.linked_plant.name})
									</StyledText>
								</View>
							)}
						</View>
					))
				)}
			</View>
			<Spacer space={Styling.Spacing.xxl} />
		</StyledView>
	);
};

export default ProbesView;

const styles = StyleSheet.create({
	content: {
		width: "100%",
		paddingHorizontal: Styling.Padding.reg,
	},
	emptyText: {
		color: Styling.Colors.white,
		textAlign: "center",
		marginTop: 40,
	},
	card: {
		width: "100%",
		backgroundColor: Styling.Colors.white,
		borderRadius: Styling.BorderRadius.reg,
		padding: Styling.Padding.reg,
		marginBottom: Styling.Spacing.reg,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	probeName: {
		color: Styling.Colors.black,
		flex: 1,
	},
	stateBadge: {
		paddingHorizontal: Styling.Padding.sml,
		paddingVertical: Styling.Padding.xsm,
		borderRadius: Styling.BorderRadius.sml,
	},
	stateText: {
		color: Styling.Colors.white,
		fontSize: Styling.Fonts.Size.sml,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: Styling.Padding.xsm,
	},
	label: {
		color: Styling.Colors.darkGrey,
	},
	value: {
		color: Styling.Colors.black,
		flex: 1,
		textAlign: "right",
	},
});
