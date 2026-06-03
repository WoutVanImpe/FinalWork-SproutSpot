import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import StyledIcon from "../../../style/StyledIcon";
import StyledText from "../../../style/StyledText";
import UndoIcon from "../../../../assets/icons/undo.svg";
import { Styling } from "../../../../constants/Styling";
import { BAR_MARGIN } from "../../../../constants/tabConfig";
import { scaled } from "../../../../constants/scale";

const EditTopBar = ({ onExit }: { onExit: () => void }) => {
	return (
		<View style={styles.row}>
			<TouchableOpacity style={styles.backBtn} onPress={onExit}>
				<StyledIcon Icon={UndoIcon} size="med" />
			</TouchableOpacity>
			<TouchableOpacity style={styles.doneBtn} onPress={onExit}>
				<StyledText type="head4" style={styles.doneBtnText}>
					Klaar
				</StyledText>
			</TouchableOpacity>
		</View>
	);
};

export default EditTopBar;

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: BAR_MARGIN,
	},
	backBtn: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	doneBtn: {
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
		justifyContent: "center",
	},
	doneBtnText: {
		color: Styling.Colors.white,
	},
});

