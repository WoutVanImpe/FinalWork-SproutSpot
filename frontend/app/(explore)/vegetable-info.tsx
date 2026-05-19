import { Image, StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Styling } from "../../constants/Styling";
import StyledView from "../../components/style/StyledView";
import StyledText from "../../components/style/StyledText";
import StyledIcon from "../../components/style/StyledIcon";
import StyledButton from "../../components/style/StyledButton";
import Spacer from "../../components/style/Spacer";
import BackIcon from "../../assets/icons/undo.svg";
import { getPlantById } from "../../services/plants";
import type { PlantDetail } from "../../services/plants";
import { formatSowingPeriod, formatTemperature } from "../../data/vegetables";
import WaveBackground from "../../components/shared/WaveBackground";

const DetailRow = ({ label, value }: { label: string; value: string }) => (
	<View style={detailStyles.row}>
		<StyledText type="paragh" style={detailStyles.label}>
			{label}
		</StyledText>
		<StyledText type="paragh" style={detailStyles.value}>
			{value}
		</StyledText>
	</View>
);

const detailStyles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: Styling.Spacing.sml,
		borderBottomWidth: 1,
		borderBottomColor: Styling.Colors.lightGrey,
	},
	label: { color: Styling.Colors.white },
	value: { color: Styling.Colors.white },
});

const VegetableInfo = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [veg, setVeg] = useState<PlantDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		getPlantById(id)
			.then((res) => { if (res.data) setVeg(res.data); })
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [id]);

	if (loading) {
		return (
			<StyledView>
				<ActivityIndicator color={Styling.Colors.green} style={{ marginTop: 100 }} />
			</StyledView>
		);
	}

	if (!veg) return null;

	return (
		<StyledView>
			<View style={styles.header}>
				<View style={styles.headerBack}>
					<TouchableOpacity onPress={() => router.navigate("/(explore)/explore")}>
						<StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
					</TouchableOpacity>
				</View>
				<StyledText type="head1" style={styles.headerTitle}>
					{veg.name}
				</StyledText>
			</View>

			{/* Row 2: Image + General Info */}
			<View style={styles.infoRow}>
				<WaveBackground waveHeight={310} leftOffset={-770} widthMultiplier={6} style={{marginTop: 15}} />
				<View style={styles.infoRowContent}>
					<View style={styles.imageContainer}>
						<Image source={{ uri: veg.image }} style={styles.image} resizeMode="contain" />
					</View>
					<View style={styles.generalInfo}>
						<DetailRow label="Licht" value={veg.light} />
						<DetailRow label="Water" value={veg.water} />
						<DetailRow label="Moeilijkheid" value={veg.difficulty} />
						<DetailRow label="Temperatuur" value={formatTemperature(veg.temperature.min, veg.temperature.max)} />
					</View>
				</View>
			</View>

			<Spacer space={Styling.Spacing.xsm} />

			{/* Row 3: Sowing Specifics */}
			<StyledText type="head3" style={styles.sectionTitle}>
				Zaai specificaties
			</StyledText>
			<Spacer space={Styling.Spacing.sml} />
			<View style={styles.sowingGrid}>
				<View style={styles.sowingItem}>
					<StyledText type="smParagh" style={styles.sowingLabel}>
						Zaaidiepte
					</StyledText>
					<StyledText type="paragh" style={styles.sowingValue}>
						{veg.sowingDepth}
					</StyledText>
				</View>
				<View style={styles.sowingItem}>
					<StyledText type="smParagh" style={styles.sowingLabel}>
						Plantafstand
					</StyledText>
					<StyledText type="paragh" style={styles.sowingValue}>
						{veg.sowingDistance}
					</StyledText>
				</View>
				<View style={styles.sowingItem}>
					<StyledText type="smParagh" style={styles.sowingLabel}>
						Potdiepte
					</StyledText>
					<StyledText type="paragh" style={styles.sowingValue}>
						{veg.potDepth}
					</StyledText>
				</View>
				<View style={styles.sowingItem}>
					<StyledText type="smParagh" style={styles.sowingLabel}>
						Periode
					</StyledText>
					<StyledText type="paragh" style={styles.sowingValue}>
						{formatSowingPeriod(veg.sowingPeriod.startMonth, veg.sowingPeriod.endMonth)}
					</StyledText>
				</View>
			</View>

			<Spacer space={Styling.Spacing.lrg} />

			{/* Row 4: Growing Stages */}
			<StyledText type="head3" style={styles.sectionTitle}>
				Groeicyclus
			</StyledText>
			<Spacer space={Styling.Spacing.sml} />
			<View style={styles.stagesContainer}>
				{veg.stages.map((stage, i) => (
					<View key={i} style={styles.stageRow}>
						<StyledText type="paragh" style={styles.stageLabel}>
							{stage.label}
						</StyledText>
						<StyledText type="smParagh" style={styles.stageDays}>
							{stage.durationDays} dagen
						</StyledText>
					</View>
				))}
			</View>
			<StyledText type="smParagh" style={styles.totalTime}>
				Totale tijd: ±{veg.totalDays} dagen
			</StyledText>

			<Spacer space={Styling.Spacing.xlg} />

			{/* Row 5: Action Button */}
			<TouchableOpacity onPress={() => router.push(`/(explore)/plant-step1?vegId=${id}`)} activeOpacity={0.7}>
				<StyledButton>{"Deze " + veg.name.toLowerCase() + " planten"}</StyledButton>
			</TouchableOpacity>
			<Spacer space={175} />
		</StyledView>
	);
};

export default VegetableInfo;

const styles = StyleSheet.create({
	header: {
		position: "relative",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Styling.Spacing.sml,
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
	},
	infoRow: {
		position: "relative",
		height: 260,
    marginTop: -10,
	},
	infoRowContent: {
		flex: 1,
		flexDirection: "row",
		gap: Styling.Spacing.med,
		zIndex: 2,
	},
	imageContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	image: {
		width: "100%",
		height: 150,
	},
	generalInfo: {
		flex: 1.5,
		justifyContent: "center",
	},
	sectionTitle: {
		color: Styling.Colors.white,
	},
	sowingGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
    justifyContent: "space-between",
		gap: Styling.Spacing.reg,
	},
	sowingItem: {
		width: "45%",
		paddingVertical: Styling.Spacing.sml,
		borderBottomWidth: 1,
		borderBottomColor: Styling.Colors.lightGrey,
	},
	sowingLabel: {
		color: Styling.Colors.white,
	},
	sowingValue: {
		color: Styling.Colors.white,
	},
	stagesContainer: {},
	stageRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Styling.Spacing.sml,
		paddingVertical: Styling.Spacing.sml,
		borderBottomWidth: 1,
		borderBottomColor: Styling.Colors.lightGrey,
	},
	stageLabel: {
		color: Styling.Colors.white,
		flex: 1,
	},
	stageDays: {
		color: Styling.Colors.white,
	},
	totalTime: {
		color: Styling.Colors.white,
		marginTop: Styling.Spacing.sml,
		textAlign: "right",
	},
});
