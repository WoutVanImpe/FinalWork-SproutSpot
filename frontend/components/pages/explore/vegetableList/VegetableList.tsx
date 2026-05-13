import { StyleSheet, TextInput, View } from "react-native";
import React from "react";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import { VegetableCardProps } from "../../../shared/vegetableCard/VegetableCard";
import CardContainer from "../../../shared/vegetableCard/CardContainer";
import SearchIcon from "../../../../assets/icons/search.svg";
import { Styling } from "../../../../constants/Styling";
import Spacer from "../../../style/Spacer";
import { BAR_MARGIN } from "../../../../constants/tabConfig";

interface VegetableListProps {
	data: VegetableCardProps[];
}

const VegetableList = ({ data }: VegetableListProps) => {
	return (
		<View style={styles.container}>
			<StyledText type="head2" style={styles.title}>
				Alle groenten
			</StyledText>
			<Spacer space={Styling.Spacing.med} />
			<View style={styles.searchBar}>
				<StyledIcon Icon={SearchIcon} size="reg" fill={Styling.Colors.white} />
				<TextInput style={styles.input} placeholder="Zoeken..." placeholderTextColor={Styling.Colors.white} />
			</View>
			<Spacer space={Styling.Spacing.reg} />
			<CardContainer data={data} style={{ marginBottom: 175 }} />
		</View>
	);
};

export default VegetableList;

const styles = StyleSheet.create({
	container: {
		width: "100%",
	},
	title: {
		alignSelf: "flex-start",
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		borderWidth: 1,
		borderColor: Styling.Colors.white,
		borderRadius: Styling.BorderRadius.reg,
		paddingHorizontal: Styling.Spacing.reg,
		paddingVertical: Styling.Spacing.sml,
		gap: Styling.Spacing.sml,
	},
	input: {
		flex: 1,
		color: Styling.Colors.white,
		fontFamily: Styling.Fonts.Family.bold,
		fontSize: Styling.Fonts.Size.reg,
		padding: 0,
	},
});
