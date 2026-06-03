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
import { scaled } from "../../../../constants/scale";

const BTN_SIZE = scaled(32);

const BtnGroup = ({
	label,
	onRemove,
	onAdd,
	canRemove,
}: {
	label: string;
	onRemove: () => void;
	onAdd: () => void;
	canRemove: boolean;
}) => (
	<View style={groupStyles.wrapper}>
		<TouchableOpacity
			style={[groupStyles.outlineBtn, !canRemove && groupStyles.disabledBtn]}
			onPress={onRemove}
		>
			<StyledIcon
				Icon={DeleteIcon}
				size="sml"
				fill={canRemove ? Styling.Colors.white : Styling.Colors.lightGrey}
			/>
		</TouchableOpacity>
		<StyledText style={groupStyles.label}>{label}</StyledText>
		<TouchableOpacity style={groupStyles.outlineBtn} onPress={onAdd}>
			<StyledIcon Icon={AddIcon} size="sml" fill={Styling.Colors.white} />
		</TouchableOpacity>
	</View>
);

const groupStyles = StyleSheet.create({
	wrapper: {
		flexDirection: "row",
		alignItems: "center",
	},
	outlineBtn: {
		width: BTN_SIZE,
		height: BTN_SIZE,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: Styling.Colors.white,
		borderRadius: Styling.BorderRadius.reg,
	},
	disabledBtn: {
		borderColor: Styling.Colors.lightGrey,
	},
	fillBtn: {
		width: BTN_SIZE,
		height: BTN_SIZE,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Styling.Colors.green,
		borderRadius: Styling.BorderRadius.reg,
	},
	label: {
		color: Styling.Colors.white,
		paddingHorizontal: Styling.Spacing.sml,
	},
});

const LayoutControls = ({
	onRemoveCol,
	onAddCol,
	onRemoveRow,
	onAddRow,
	onZoomIn,
	onZoomOut,
	canRemoveCol,
	canRemoveRow,
}: {
	onRemoveCol: () => void;
	onAddCol: () => void;
	onRemoveRow: () => void;
	onAddRow: () => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	canRemoveCol: boolean;
	canRemoveRow: boolean;
}) => {
	return (
		<View style={styles.row}>
			<BtnGroup label="Kol" onRemove={onRemoveCol} onAdd={onAddCol} canRemove={canRemoveCol} />
			<View style={{ width: Styling.Spacing.reg }} />
			<BtnGroup label="Rij" onRemove={onRemoveRow} onAdd={onAddRow} canRemove={canRemoveRow} />

			<View style={styles.spacer} />

			<View style={zoomStyles.wrapper}>
				<TouchableOpacity style={zoomStyles.outlineBtn} onPress={onZoomOut}>
					<StyledIcon Icon={ZoomOutIcon} size="sml" fill={Styling.Colors.white} />
				</TouchableOpacity>
				<View style={{ width: Styling.Spacing.xsm }} />
				<TouchableOpacity style={zoomStyles.outlineBtn} onPress={onZoomIn}>
					<StyledIcon Icon={ZoomInIcon} size="sml" fill={Styling.Colors.white} />
				</TouchableOpacity>
			</View>
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
});

const zoomStyles = StyleSheet.create({
	wrapper: {
		flexDirection: "row",
		alignItems: "center",
	},
	outlineBtn: {
		width: BTN_SIZE,
		height: BTN_SIZE,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: Styling.Colors.white,
		borderRadius: Styling.BorderRadius.reg,
	},
	fillBtn: {
		width: BTN_SIZE,
		height: BTN_SIZE,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Styling.Colors.green,
		borderRadius: Styling.BorderRadius.reg,
	},
});


