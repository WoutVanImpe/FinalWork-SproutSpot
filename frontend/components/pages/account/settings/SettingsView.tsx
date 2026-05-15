import { ScrollView, StyleSheet, Switch, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";
import AccountHeader from "../header/AccountHeader";

interface SettingsViewProps {
	onBack: () => void;
	pushEnabled: boolean;
	onPushChange: (value: boolean) => void;
	reminderMorning: boolean;
	onMorningChange: (value: boolean) => void;
	reminderEvening: boolean;
	onEveningChange: (value: boolean) => void;
}

const SettingsView = ({ onBack, pushEnabled, onPushChange, reminderMorning, onMorningChange, reminderEvening, onEveningChange }: SettingsViewProps) => (
	<StyledView>
		<AccountHeader title="Instellingen" onBack={onBack} />
		<Spacer space={Styling.Spacing.med}/>
		<ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}>
			<StyledText type="head3" style={styles.greenSubheader}>
				Push Notificaties
			</StyledText>
			<Spacer space={Styling.Spacing.sml} />
			<View style={styles.settingRow}>
				<StyledText type="paragh" style={styles.settingLabel}>
					Push notificaties inschakelen
				</StyledText>
				<Switch value={pushEnabled} onValueChange={onPushChange} trackColor={{ false: Styling.Colors.lightGrey, true: Styling.Colors.green }} thumbColor={Styling.Colors.white} />
			</View>
			<Spacer space={Styling.Spacing.reg} />
			<StyledText type="head3" style={styles.greenSubheader}>
				Verzorgingsherinneringen
			</StyledText>
			<Spacer space={Styling.Spacing.sml} />
			<View style={styles.settingRow}>
				<StyledText type="paragh" style={styles.settingLabel}>
					Ochtend (08:00)
				</StyledText>
				<Switch value={reminderMorning} onValueChange={onMorningChange} trackColor={{ false: Styling.Colors.lightGrey, true: Styling.Colors.green }} thumbColor={Styling.Colors.white} />
			</View>
			<View style={styles.settingRow}>
				<StyledText type="paragh" style={styles.settingLabel}>
					Avond (20:00)
				</StyledText>
				<Switch value={reminderEvening} onValueChange={onEveningChange} trackColor={{ false: Styling.Colors.lightGrey, true: Styling.Colors.green }} thumbColor={Styling.Colors.white} />
			</View>
			<Spacer space={Styling.Spacing.lrg} />
			<StyledText type="head3" style={styles.greenSubheader}>
				Account
			</StyledText>
			<Spacer space={Styling.Spacing.sml} />
			<View style={styles.settingRow}>
				<StyledText type="paragh" style={styles.settingLabel}>
					anna@email.be
				</StyledText>
			</View>
			<View style={styles.settingRow}>
				<StyledText type="paragh" style={styles.settingLabel}>
					Pairing Code: TE123456
				</StyledText>
			</View>
		</ScrollView>
	</StyledView>
);

export default SettingsView;

const styles = StyleSheet.create({
	scrollContent: {
		paddingTop: Styling.Padding.sml,
		width: "100%",
		padding: 0,
	},
	greenSubheader: {
		color: Styling.Colors.green,
	},
	settingRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Styling.Padding.sml,
		borderBottomWidth: 1,
		borderBottomColor: Styling.Colors.lightGrey,
	},
	settingLabel: {
		color: Styling.Colors.white,
	},
});
