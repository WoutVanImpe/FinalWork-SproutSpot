import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import StyledIcon from "../../../style/StyledIcon";
import StyledText from "../../../style/StyledText";
import AddIcon from "../../../../assets/icons/add.svg";
import DeleteIcon from "../../../../assets/icons/delete.svg";
import ZoomInIcon from "../../../../assets/icons/zoom_in.svg";
import ZoomOutIcon from "../../../../assets/icons/zoom_out.svg";
import { Styling } from "../../../../constants/Styling";
import { BAR_MARGIN } from "../../../../constants/tabConfig";
import Spacer from "../../../style/Spacer";

const LayoutControls = ({
	onRemoveCol,
	onAddCol,
	onRemoveRow,
	onAddRow,
	onZoomIn,
	onZoomOut,
}: {
	onRemoveCol: () => void;
	onAddCol: () => void;
	onRemoveRow: () => void;
	onAddRow: () => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
}) => {
	return (
		<View style={styles.row}>
			<TouchableOpacity style={styles.btn} onPress={onRemoveCol}>
				<StyledIcon Icon={DeleteIcon} size="reg" fill={Styling.Colors.white} />
			</TouchableOpacity>
			<StyledText type="paragh" style={styles.label}>
				Kol
			</StyledText>
			<TouchableOpacity style={styles.btn} onPress={onAddCol}>
				<StyledIcon Icon={AddIcon} size="reg" fill={Styling.Colors.white} />
			</TouchableOpacity>
			<View style={{ width: Styling.Spacing.med }} />
			<TouchableOpacity style={styles.btn} onPress={onRemoveRow}>
				<StyledIcon Icon={DeleteIcon} size="reg" fill={Styling.Colors.white} />
			</TouchableOpacity>
			<StyledText type="paragh" style={styles.label}>
				Rij
			</StyledText>
			<TouchableOpacity style={styles.btn} onPress={onAddRow}>
				<StyledIcon Icon={AddIcon} size="reg" fill={Styling.Colors.white} />
			</TouchableOpacity>

			<View style={styles.spacer} />

			<TouchableOpacity style={styles.zoomBtn} onPress={onZoomOut}>
				<StyledIcon Icon={ZoomOutIcon} size="reg" fill={Styling.Colors.white} />
			</TouchableOpacity>
			<View style={{width: Styling.Spacing.sml}} />
			<TouchableOpacity style={styles.zoomBtn} onPress={onZoomIn}>
				<StyledIcon Icon={ZoomInIcon} size="reg" fill={Styling.Colors.white} />
			</TouchableOpacity>
		</View>
	);
};

export default LayoutControls;

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: BAR_MARGIN,
	},
	spacer: {
		marginLeft: "auto",
	},
	btn: {
		aspectRatio: 1,
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.sml,
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		color: Styling.Colors.white,
		marginHorizontal: Styling.Spacing.xsm,
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
