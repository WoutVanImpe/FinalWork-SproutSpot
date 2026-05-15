import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import StyledIcon from "../../../style/StyledIcon";
import StyledText from "../../../style/StyledText";
import ZoomInIcon from "../../../../assets/icons/zoom_in.svg";
import ZoomOutIcon from "../../../../assets/icons/zoom_out.svg";
import { Styling } from "../../../../constants/Styling";
import { BAR_MARGIN } from "../../../../constants/tabConfig";

const ViewTopBar = ({
	onEdit,
	onZoom,
}: {
	onEdit: () => void;
	onZoom: (dir: "in" | "out") => void;
}) => {
	return (
		<View style={styles.row}>
			<TouchableOpacity style={styles.editBtn} onPress={onEdit}>
				<StyledText type="head4" style={styles.editBtnText}>
					Bewerken
				</StyledText>
			</TouchableOpacity>
			<TouchableOpacity style={styles.zoomBtn} onPress={() => onZoom("out")}>
				<StyledIcon Icon={ZoomOutIcon} size="reg" fill={Styling.Colors.white} />
			</TouchableOpacity>
			<TouchableOpacity style={styles.zoomBtn} onPress={() => onZoom("in")}>
				<StyledIcon Icon={ZoomInIcon} size="reg" fill={Styling.Colors.white} />
			</TouchableOpacity>
		</View>
	);
};

export default ViewTopBar;

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Styling.Spacing.sml,
		paddingHorizontal: BAR_MARGIN,
		width: "100%",
	},
	editBtn: {
		width: 150,
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
		marginRight: "auto",
	},
	editBtnText: {
		color: Styling.Colors.white,
	},
	zoomBtn: {
		aspectRatio: 1,
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.sml,
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
		justifyContent: "center",
	},
});
