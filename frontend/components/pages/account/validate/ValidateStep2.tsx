import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";
import AccountHeader from "../header/AccountHeader";

interface ValidateStep2Props {
	onBack: () => void;
	onConfirm: () => void;
}

const ValidateStep2 = ({ onBack, onConfirm }: ValidateStep2Props) => (
	<StyledView>
		<AccountHeader title="Fase aanpassingen" onBack={onBack} />
		<ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}>
			<StyledText type="head3" style={styles.greenSubheader}>
				Wat verandert er in deze fase?
			</StyledText>
			<Spacer space={Styling.Spacing.reg} />
			<StyledText type="head4" style={styles.changeLabel}>Water</StyledText>
			<StyledText type="paragh" style={styles.bodyText}>
				Verhoog de watergift naar 2x per dag. Houd de grond vochtig maar niet doorweekt.
			</StyledText>
			<Spacer space={Styling.Spacing.reg} />
			<StyledText type="head4" style={styles.changeLabel}>Licht</StyledText>
			<StyledText type="paragh" style={styles.bodyText}>
				Zorg voor minstens 6 uur direct zonlicht per dag. Verplaats de plant indien nodig naar een zonnigere plek.
			</StyledText>
			<Spacer space={Styling.Spacing.reg} />
			<StyledText type="head4" style={styles.changeLabel}>Meststof</StyledText>
			<StyledText type="paragh" style={styles.bodyText}>
				Voeg een vloeibare meststof toe aan het water, 1x per week. Kies een meststof rijk aan kalium en fosfor.
			</StyledText>
			<Spacer space={Styling.Spacing.reg} />
			<StyledText type="head4" style={styles.changeLabel}>Temperatuur</StyledText>
			<StyledText type="paragh" style={styles.bodyText}>
				Houd een temperatuur aan van 18-25°C. Vermijd tocht en plotselinge temperatuurschommelingen.
			</StyledText>
			<Spacer space={Styling.Spacing.lrg} />
			<TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
				<StyledText type="head4" fullCap style={styles.confirmButtonText}>
					Bevestig & Klaar
				</StyledText>
			</TouchableOpacity>
		</ScrollView>
	</StyledView>
);

export default ValidateStep2;

const styles = StyleSheet.create({
	scrollContent: {
		paddingTop: Styling.Padding.sml,
		width: "100%",
		padding: 0,
	},
	greenSubheader: {
		color: Styling.Colors.green,
	},
	bodyText: {
		color: Styling.Colors.white,
		lineHeight: 22,
	},
	changeLabel: {
		color: Styling.Colors.green,
		marginBottom: Styling.Spacing.xsm,
	},
	confirmButton: {
		width: "100%",
		paddingVertical: Styling.Padding.med,
		borderRadius: Styling.BorderRadius.med,
		backgroundColor: Styling.Colors.green,
		alignItems: "center",
	},
	confirmButtonText: {
		color: Styling.Colors.white,
	},
});
