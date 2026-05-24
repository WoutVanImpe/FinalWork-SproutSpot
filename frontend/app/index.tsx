import { StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import StyledView from "../components/style/StyledView";
import StyledText from "../components/style/StyledText";
import Spacer from "../components/style/Spacer";
import { Styling } from "../constants/Styling";
import CardContainer from "../components/shared/vegetableCard/CardContainer";
import StatusHeader from "../components/pages/home/statusHeader/StatusHeader";
import { getDashboard } from "../services/garden";
import type { EnrichedPlant } from "../services/garden";
import { useRouter } from "expo-router";

interface HomePlant {
	id: string;
	name: string;
	type: string;
	warning: boolean;
	message: string;
	image: { uri: string };
}

const toHomePlant = (p: EnrichedPlant): HomePlant => {
	const alerts: string[] = [];
	if (p.warning) {
		if (p.water.level < p.water.optimalMin) alerts.push("DORST");
		else if (p.water.level > p.water.optimalMax) alerts.push("te nat");
		if (p.light.level < p.light.optimalMin) alerts.push("te donker");
		else if (p.light.level > p.light.optimalMax) alerts.push("te licht");
		if (p.temperature.level < p.temperature.optimalMin) alerts.push("te koud");
		else if (p.temperature.level > p.temperature.optimalMax) alerts.push("te warm");
	}
	return {
		id: p.id,
		name: p.nickname.split(" ").slice(1).join(" ") || p.nickname,
		type: p.type,
		warning: p.warning,
		message: alerts.join(", ") || "niks nodig",
		image: typeof p.image === "string" ? { uri: p.image } : p.image,
	};
};

const Index = () => {
	const router = useRouter();
	const [plants, setPlants] = useState<EnrichedPlant[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getDashboard()
			.then((res) => { if (res.data) setPlants(res.data.plants); })
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const homePlants = plants.map(toHomePlant);

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
