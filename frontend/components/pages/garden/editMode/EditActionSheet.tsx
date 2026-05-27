import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Styling } from "../../../../constants/Styling";
import Spacer from "../../../style/Spacer";
import StyledIcon from "../../../style/StyledIcon";
import StyledText from "../../../style/StyledText";
import CloseIcon from "../../../../assets/icons/close.svg";
import { GardenPlant } from "../gardenGrid/GardenGridItem";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const EditActionSheet = ({
	plant,
	isVisible,
	onClose,
	onMove,
	onDelete,
}: {
	plant: GardenPlant | null;
	isVisible: boolean;
	onClose: () => void;
	onMove: () => void;
	onDelete: () => void;
}) => {
	const insets = useSafeAreaInsets();
	const slideAnim = useRef(new Animated.Value(0)).current;
	const prevVisible = useRef(false);

	useEffect(() => {
		if (isVisible) {
			slideAnim.setValue(0);
			Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
		} else if (prevVisible.current) {
			Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
		}
		prevVisible.current = isVisible;
	}, [isVisible]);

	if (!plant && !prevVisible.current) return null;

	const sheetTranslateY = slideAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [SCREEN_HEIGHT, 0],
	});

	return (
		<View style={styles.wrapper} pointerEvents="box-none">
			<Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }], paddingBottom: Styling.Padding.xlg + insets.bottom }]}>
				<View style={styles.handle} />
				{plant && (
					<>
						<View style={styles.header}>
							<StyledText type="head1" style={styles.title}>
								{plant.nickname}
							</StyledText>
							<TouchableOpacity onPress={onClose} style={styles.closeBtn}>
								<StyledIcon Icon={CloseIcon} size="reg" fill={Styling.Colors.white} />
							</TouchableOpacity>
						</View>
						<Spacer space={Styling.Spacing.xsm} />
						<StyledText type="paragh" style={styles.subtitle}>
							Stadium: {plant.stage.label}
						</StyledText>
						<Spacer space={Styling.Spacing.lrg} />
						<TouchableOpacity style={styles.actionBtn} onPress={onMove}>
							<StyledText type="head4" style={styles.actionBtnText}>
								Verplaats
							</StyledText>
						</TouchableOpacity>
						<Spacer space={Styling.Spacing.sml} />
						<TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={onDelete}>
							<StyledText type="head4" style={styles.actionBtnText}>
								Verwijder
							</StyledText>
						</TouchableOpacity>
					</>
				)}
			</Animated.View>
		</View>
	);
};

export default EditActionSheet;

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: Styling.Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 25,
		paddingBottom: Styling.Padding.xlg,
	},
	handle: {
		width: 40,
		height: 4,
		borderRadius: 5,
		backgroundColor: Styling.Colors.darkGrey,
		alignSelf: "center",
		marginTop: Styling.Spacing.sml,
		marginBottom: Styling.Spacing.med,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	title: {
		color: Styling.Colors.green,
		flex: 1,
		marginRight: Styling.Spacing.sml,
	},
	closeBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: Styling.Colors.green,
		alignItems: "center",
		justifyContent: "center",
	},
	subtitle: {
		color: Styling.Colors.darkGrey,
	},
	actionBtn: {
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	actionBtnDanger: {
		backgroundColor: Styling.Colors.red,
	},
	actionBtnText: {
		color: Styling.Colors.white,
	},
});
