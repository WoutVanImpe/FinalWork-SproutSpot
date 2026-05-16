import { Animated, Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Styling } from "../../../../constants/Styling";
import Spacer from "../../../style/Spacer";
import StyledIcon from "../../../style/StyledIcon";
import StyledText from "../../../style/StyledText";
import CloseIcon from "../../../../assets/icons/close.svg"
import { GardenPlant } from "../gardenGrid/GardenGridItem";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BAR_TRACK_H = 8;
const BAR_FILL_MIN_H = 6;

const StatusBar = ({ level, optimalMin, optimalMax }: { level: number; optimalMin: number; optimalMax: number }) => {
	return (
		<View style={statusBarStyles.track}>
			<View style={[statusBarStyles.fill, { width: `${level}%`, left: 1 }]} />
			<View style={[statusBarStyles.optimalMark, { left: `${optimalMin}%` }]} />
			<View style={[statusBarStyles.optimalMark, { left: `${optimalMax}%` }]} />
		</View>
	);
};

const statusBarStyles = StyleSheet.create({
	track: {
		flex: 1,
		height: BAR_TRACK_H,
		backgroundColor: "#e8e8e8",
		borderRadius: BAR_TRACK_H / 2,
		position: "relative",
		overflow: "visible",
	},
	fill: {
		position: "absolute",
		left: 0,
		top: (BAR_TRACK_H - BAR_FILL_MIN_H) / 2,
		height: BAR_FILL_MIN_H,
		backgroundColor: Styling.Colors.green,
		borderRadius: BAR_FILL_MIN_H / 2,
	},
	optimalMark: {
		position: "absolute",
		top: -2,
		bottom: -2,
		width: 2,
		backgroundColor: Styling.Colors.darkGrey,
		borderRadius: 1,
	},
});

const Row = ({ label, value, children, style }: { label: string; value?: string; children?: React.ReactNode; style?: ViewStyle }) => (
	<View style={[rowStyles.row, style]}>
		<StyledText type="paragh" style={rowStyles.label}>
			{label}
			{value ? `: ${value}` : ""}
		</StyledText>
		{children}
	</View>
);

const rowStyles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Styling.Spacing.reg,
	},
	label: {
		color: Styling.Colors.darkGrey,
		width: "50%",
		flexShrink: 0,
	},
});

const PlantSheet = ({ plant, isVisible, onClose }: { plant: GardenPlant | null; isVisible: boolean; onClose: () => void }) => {
	const [internalVisible, setInternalVisible] = useState(false);
	const slideAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (isVisible) {
			setInternalVisible(true);
		} else if (internalVisible) {
			Animated.parallel([Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }), Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true })]).start(() => setInternalVisible(false));
		}
	}, [isVisible]);

	useEffect(() => {
		if (internalVisible && isVisible) {
			Animated.parallel([Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }), Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true })]).start();
		}
	}, [internalVisible]);

	if (!plant && !internalVisible) return null;

	const sheetTranslateY = slideAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [SCREEN_HEIGHT, 0],
	});

	return (
		<Modal visible={internalVisible} transparent animationType="none" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
					<TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
				</Animated.View>
				<Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
					<View style={styles.handle} />
					{plant && (
						<ScrollView bounces={false} showsVerticalScrollIndicator={false}>
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
								Stadium: {plant.stage.label} ({plant.stage.current}/{plant.stage.max})
							</StyledText>
							<Spacer space={Styling.Spacing.sml} />

							<StyledText type="head4" style={styles.sectionTitle}>
								Hoe gaat het nu:
							</StyledText>
							<Spacer space={Styling.Spacing.xsm} />

							<Row label="Water" value={plant.water.label}>
								<StatusBar level={plant.water.level} optimalMin={plant.water.optimalMin} optimalMax={plant.water.optimalMax} />
							</Row>
							<Spacer space={Styling.Spacing.sml} />
							<Row label="Licht" value={plant.light.label}>
								<StatusBar level={plant.light.level} optimalMin={plant.light.optimalMin} optimalMax={plant.light.optimalMax} />
							</Row>
							<Spacer space={Styling.Spacing.sml} />
							<Row label="Warmte" value={plant.temperature.label}>
								<StatusBar level={plant.temperature.level} optimalMin={plant.temperature.optimalMin} optimalMax={plant.temperature.optimalMax} />
							</Row>
							<Spacer space={Styling.Spacing.sml} />

							<StyledText type="head4" style={styles.sectionTitle}>
								Advies:
							</StyledText>
							<Spacer space={Styling.Spacing.xsm} />
							<StyledText type="paragh" style={styles.bodyText}>
								{plant.advice}
							</StyledText>
							<Spacer space={Styling.Spacing.sml} />

							<StyledText type="head4" style={styles.sectionTitle}>
								Sonde:
							</StyledText>
							<Spacer space={Styling.Spacing.xsm} />
							<StyledText type="paragh" style={styles.bodyText}>
								Batterij: {plant.battery}%
							</StyledText>
							<Spacer space={Styling.Spacing.sml} />

							<TouchableOpacity style={styles.footerBtn} onPress={() => { onClose(); router.push({ pathname: "/(garden)/plant-detail", params: { plantData: JSON.stringify(plant) } }); }}>
								<StyledText type="head4" style={styles.footerBtnText}>
									Bekijk in detail
								</StyledText>
							</TouchableOpacity>
						</ScrollView>
					)}
				</Animated.View>
			</View>
		</Modal>
	);
};

export default PlantSheet;

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "flex-end",
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.45)",
	},
	sheet: {
		backgroundColor: Styling.Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 25,
		paddingBottom: Styling.Padding.xlg,
		maxHeight: SCREEN_HEIGHT * 0.75,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.12,
		shadowRadius: 6,
		elevation: 10,
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
	sectionTitle: {
		color: Styling.Colors.green,
		marginTop: Styling.Spacing.sml,
	},
	bodyText: {
		color: Styling.Colors.darkGrey,
	},
	footerBtn: {
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
		borderRadius: Styling.BorderRadius.reg,
		alignSelf: "center",
		marginTop: Styling.Spacing.med,
	},
	footerBtnText: {
		color: Styling.Colors.white,
	},
});
