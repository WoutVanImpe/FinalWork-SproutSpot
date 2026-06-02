import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import StyledButton from "../../../style/StyledButton";
import Spacer from "../../../style/Spacer";
import AccountHeader from "../header/AccountHeader";
import { scaled } from "../../../../constants/scale";

interface ValidateStep1Props {
	plantName?: string;
	onBack: () => void;
	onNext: () => void;
}

const ValidateStep1 = ({ plantName, onBack, onNext }: ValidateStep1Props) => (
	<StyledView>
		<AccountHeader title="Fase herkenning" onBack={onBack} />
		<Spacer space={Styling.Spacing.med} />
		<ScrollView contentContainerStyle={styles.scrollContent}>
			<StyledText type="head3" style={styles.subheader}>
				Hoe herken je het nieuwe stadium?
			</StyledText>
			<Spacer space={Styling.Spacing.sml} />
			<StyledText type="paragh" style={styles.bodyText}>
				{plantName ? `${plantName} geeft aan dat het een nieuw groeistadium heeft bereikt.` : "Je plant heeft aangegeven dat het een nieuw groeistadium heeft bereikt."} Controleer of je plant de volgende kenmerken vertoont:
			</StyledText>
			<Spacer space={Styling.Spacing.reg} />
			<StyledText type="paragh" style={styles.bodyText}>
				In dit stadium beginnen zich bloemknoppen te vormen aan de toppen van de stengels. De bladeren worden groter en krijgen een diepere groene kleur. Dit is een teken dat de plant klaar is voor de volgende fase van groei.
			</StyledText>
			<Spacer space={Styling.Spacing.lrg} />
			<View style={styles.validateFooter}>
				<TouchableOpacity style={styles.flexButton} onPress={onBack}>
					<StyledButton fullCap style={styles.outlinedButton}>Nog niet</StyledButton>
				</TouchableOpacity>
				<TouchableOpacity style={styles.flexButton} onPress={onNext}>
					<StyledButton fullCap style={styles.stretchButton}>Volgende fase</StyledButton>
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
		paddingBottom: scaled(120),
	},
	subheader: {
		color: Styling.Colors.white,
	},
	bodyText: {
		color: Styling.Colors.white,
		lineHeight: scaled(22),
	},
	validateFooter: {
		flexDirection: "row",
		gap: Styling.Spacing.sml,
		width: "100%",
	},
	flexButton: {
		flex: 1,
	},
	outlinedButton: {
		alignSelf: "stretch",
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: Styling.Colors.white,
	},
	stretchButton: {
		alignSelf: "stretch",
	},
});


