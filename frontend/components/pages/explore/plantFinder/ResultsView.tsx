import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import Spacer from "../../../style/Spacer";
import BackIcon from "../../../../assets/icons/undo.svg";
import { VegetableInfo } from "../../../../data/vegetables";
import CardContainer from "../../../shared/vegetableCard/CardContainer";

interface Props {
	results: VegetableInfo[];
	onRestart: () => void;
}

const ResultsView = ({ results, onRestart }: Props) => (
	<StyledView>
		<View style={styles.header}>
			<TouchableOpacity style={styles.headerBack} onPress={() => router.navigate("/(explore)/explore")}>
				<StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
			</TouchableOpacity>
			<StyledText type="head1" style={styles.headerTitle}>
				Resultaten
			</StyledText>
		</View>
		<Spacer space={Styling.Spacing.reg} />
		<StyledText type="paragh" style={styles.resultCount}>
			{results.length > 0 ? `We vonden ${results.length} geschikte ${results.length === 1 ? "plant" : "planten"} voor jou!` : "Geen resultaten gevonden voor jouw antwoorden."}
		</StyledText>
		<Spacer space={Styling.Spacing.reg} />
		{results.length > 0 ? (
			<CardContainer data={results} onItemPress={(id) => router.push(`/(explore)/vegetable-info?id=${id}`)} />
		) : (
			<StyledText type="paragh" style={{ color: Styling.Colors.white, textAlign: "center" }}>
				Probeer andere antwoorden.
			</StyledText>
		)}
		<Spacer space={Styling.Spacing.xxl} />
		<TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
			<StyledText type="paragh" style={{ color: Styling.Colors.green }}>
				Opnieuw beginnen
			</StyledText>
		</TouchableOpacity>
		<Spacer space={175} />
	</StyledView>
);

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Styling.Spacing.sml,
	},
	headerTitle: {
		color: Styling.Colors.white,
		textAlign: "center",
		flexShrink: 1,
		paddingLeft: 50,
		paddingRight: 50,
	},
	headerBack: {
		position: "absolute",
		left: 0,
		zIndex: 1,
	},
	resultCount: {
		color: Styling.Colors.white,
		lineHeight: 22,
		textAlign: "center",
		paddingHorizontal: Styling.Padding.reg,
	},
	restartBtn: {
		alignSelf: "center",
		paddingVertical: Styling.Padding.sml,
	},
});

export default ResultsView;
