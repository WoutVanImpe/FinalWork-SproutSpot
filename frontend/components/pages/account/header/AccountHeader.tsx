import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import ArrowLeft from "../../../../assets/icons/arrow_left.svg";

interface AccountHeaderProps {
	title: string;
	onBack: () => void;
}

const AccountHeader = ({ title, onBack }: AccountHeaderProps) => (
	<View style={styles.header}>
		<View style={styles.headerBack}>
			<TouchableOpacity onPress={onBack}>
				<StyledIcon Icon={ArrowLeft} size="med" fill={Styling.Colors.white} />
			</TouchableOpacity>
		</View>
		<StyledText type="head2" style={styles.headerTitle}>
			{title}
		</StyledText>
	</View>
);

export default AccountHeader;

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		color: Styling.Colors.white,
	},
	headerBack: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		justifyContent: "center",
		zIndex: 1,
	},
});
