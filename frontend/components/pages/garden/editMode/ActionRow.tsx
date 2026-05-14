import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import StyledText from "../../../style/StyledText";
import { Styling } from "../../../../constants/Styling";
import { BAR_MARGIN } from "../../../../constants/tabConfig";

const ActionRow = ({
	isMoving,
	hasSelection,
	onMove,
	onDelete,
	onCancelMove,
}: {
	isMoving: boolean;
	hasSelection: boolean;
	onMove: () => void;
	onDelete: () => void;
	onCancelMove: () => void;
}) => {
	if (isMoving) {
		return (
			<View style={styles.row}>
				<TouchableOpacity style={styles.cancelBtn} onPress={onCancelMove}>
					<StyledText type="paragh" style={styles.cancelText}>
						Annuleren
					</StyledText>
				</TouchableOpacity>
			</View>
		);
	}

	if (!hasSelection) return null;

	return (
		<View style={styles.row}>
			<View style={styles.buttonGroup}>
				<TouchableOpacity style={styles.actionBtn} onPress={onMove}>
					<StyledText type="head4" style={styles.actionBtnText}>
						Verplaats
					</StyledText>
				</TouchableOpacity>
				<View style={{ width: Styling.Spacing.reg }} />
				<TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={onDelete}>
					<StyledText type="head4" style={styles.actionBtnText}>
						Verwijder
					</StyledText>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default ActionRow;

const styles = StyleSheet.create({
	row: {
		alignItems: "center",
		paddingHorizontal: BAR_MARGIN,
	},
	buttonGroup: {
		flexDirection: "row",
		width: "100%",
	},
	actionBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
		gap: Styling.Spacing.sml,
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
		borderRadius: Styling.BorderRadius.reg,
	},
	actionBtnDanger: {
		backgroundColor: Styling.Colors.red,
	},
	actionBtnText: {
		color: Styling.Colors.white,
	},
	cancelBtn: {
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
	},
	cancelText: {
		color: Styling.Colors.green,
		textDecorationLine: "underline",
	},
});
