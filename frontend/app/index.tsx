import { StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useCallback, useState } from "react";
import StyledView from "../components/style/StyledView";
import StyledText from "../components/style/StyledText";
import StyledButton from "../components/style/StyledButton";
import Spacer from "../components/style/Spacer";
import { Styling } from "../constants/Styling";
import CardContainer from "../components/shared/vegetableCard/CardContainer";
import StatusHeader from "../components/pages/home/statusHeader/StatusHeader";
import { getDashboard } from "../services/garden";
import type { EnrichedPlant } from "../services/garden";
import { useRouter, useFocusEffect } from "expo-router";
import { scaled } from "../constants/scale";

interface HomePlant {
	id: string;
	name: string;
	type: string;
	warning: boolean;
	probeOffline: boolean;
	message: string;
	image: { uri: string };
}

const toHomePlant = (p: EnrichedPlant): HomePlant => {
	const message = p.probeOffline ? "" : (() => {
		const alerts: string[] = [];
		if (p.warning) {
			if (p.water.level < p.water.optimalMin) alerts.push("dorst");
			else if (p.water.level > p.water.optimalMax) alerts.push("het te nat");
			if (p.light.level < p.light.optimalMin) alerts.push("te weinig licht");
			else if (p.light.level > p.light.optimalMax) alerts.push("te veel licht");
			if (p.temperature.level < p.temperature.optimalMin) alerts.push("het te koud");
			else if (p.temperature.level > p.temperature.optimalMax) alerts.push("het te warm");
		}
		return alerts.length > 1
			? alerts.slice(0, -1).join(", ") + " en " + alerts[alerts.length - 1]
			: alerts[0] || "niks nodig";
	})();
	return {
		id: p.id,
		name: p.nickname.split(" ").slice(1).join(" ") || p.nickname,
		type: p.type,
		warning: p.warning,
		probeOffline: p.probeOffline,
		message,
		image: typeof p.image === "string" ? { uri: p.image } : p.image,
	};
};

const Index = () => {
	const router = useRouter();
	const [plants, setPlants] = useState<EnrichedPlant[]>([]);
	const [loading, setLoading] = useState(true);

	useFocusEffect(useCallback(() => {
		setLoading(true);
		getDashboard()
			.then((res) => { if (res.data) setPlants(res.data.plants); })
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []));

	const homePlants = plants.map(toHomePlant).sort((a, b) => (a.warning === b.warning ? 0 : a.warning ? -1 : 1));

	const handleItemPress = (id: string) => {
		router.push(`/(garden)/garden?selectedPlantId=${id}`);
	};

	if (loading) {
		return (
			<StyledView>
				<ActivityIndicator color={Styling.Colors.green} style={{ marginTop: 100 }} />
			</StyledView>
		);
	}

	if (plants.length === 0) {
		return (
			<StyledView>
				<Spacer space={scaled(120)} />
				<StyledText type="head3" style={{ textAlign: "center" }}>
					Je hebt nog geen planten
				</StyledText>
				<Spacer space={Styling.Spacing.med} />
				<StyledText type="paragh" style={{ textAlign: "center", color: Styling.Colors.white }}>
					Voeg planten toe om te beginnen met je tuin
				</StyledText>
				<Spacer space={Styling.Spacing.lrg} />
				<TouchableOpacity onPress={() => router.push("/(explore)/explore")}>
					<StyledButton>Planten ontdekken</StyledButton>
				</TouchableOpacity>
			</StyledView>
		);
	}

	return (
		<StyledView>
			<StatusHeader items={homePlants} onItemPress={handleItemPress} />
			<Spacer space={Styling.Spacing.med} />
			<StyledText type="head2" style={styles.head2}>
				Mijn tuin
			</StyledText>
			<CardContainer data={homePlants} onItemPress={handleItemPress} style={{ marginBottom: 175 }} />
		</StyledView>
	);
};

export default Index;

const styles = StyleSheet.create({
	head2: {
		alignSelf: "flex-start",
	},
});


