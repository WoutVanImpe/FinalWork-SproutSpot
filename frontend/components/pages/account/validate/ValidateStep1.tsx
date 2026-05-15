import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";
import AccountHeader from "../header/AccountHeader";

interface ValidateStep1Props {
	onBack: () => void;
	onNext: () => void;
}

const ValidateStep1 = ({ onBack, onNext }: ValidateStep1Props) => (
	<StyledView>
		<AccountHeader title="Fase herkenning" onBack={onBack} />
		<ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}>
			<StyledText type="head3" style={styles.greenSubheader}>
				Hoe herken je het nieuwe stadium?
			</StyledText>
			<Spacer space={Styling.Spacing.sml} />
			<StyledText type="paragh" style={styles.bodyText}>
				Je plant heeft aangegeven dat het een nieuw groeistadium heeft bereikt. Controleer of je plant de volgende kenmerken vertoont:
			</StyledText>
			<Spacer space={Styling.Spacing.reg} />
			<StyledText type="paragh" style={styles.bodyText}>
				In dit stadium beginnen zich bloemknoppen te vormen aan de toppen van de stengels. De bladeren worden groter en krijgen een diepere groene kleur. Dit is een teken dat de plant klaar is voor de volgende fase van groei.
			</StyledText>
			<Spacer space={Styling.Spacing.lrg} />
			<View style={styles.validateFooter}>
				<TouchableOpacity style={styles.notYetButton} onPress={onBack}>
					<StyledText type="head4" fullCap style={styles.notYetButtonText}>
						Nog niet
					</StyledText>
				</TouchableOpacity>
				<TouchableOpacity style={styles.nextPhaseButton} onPress={onNext}>
					<StyledText type="head4" fullCap style={styles.nextPhaseButtonText}>
						Volgende fase
					</StyledText>
				</TouchableOpacity>
			</View>
		</ScrollView>
	</StyledView>
);

export default ValidateStep1;

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
	validateFooter: {
		flexDirection: "row",
		gap: Styling.Spacing.sml,
		width: "100%",
	},
	notYetButton: {
		flex: 1,
		paddingVertical: Styling.Padding.sml,
		borderRadius: Styling.BorderRadius.reg,
		backgroundColor: Styling.Colors.white,
		borderWidth: 1,
		borderColor: Styling.Colors.green,
		alignItems: "center",
	},
	notYetButtonText: {
		color: Styling.Colors.green,
	},
	nextPhaseButton: {
		flex: 1,
		paddingVertical: Styling.Padding.sml,
		borderRadius: Styling.BorderRadius.reg,
		backgroundColor: Styling.Colors.green,
		alignItems: "center",
	},
	nextPhaseButtonText: {
		color: Styling.Colors.white,
	},
});
