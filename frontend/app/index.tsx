import { StyleSheet } from "react-native";
import React from "react";
import StyledView from "../components/style/StyledView";
import StyledText from "../components/style/StyledText";
import Spacer from "../components/style/Spacer";
import { Styling } from "../constants/Styling";
import CardContainer from "../components/shared/vegetableCard/CardContainer";
import StatusHeader from "../components/pages/home/statusHeader/StatusHeader";
import { initialPlants } from "../data/gardenPlants";
import { useRouter } from "expo-router";

const HOME_PLANTS = initialPlants.map((p) => {
	let message = "niks nodig";
	if (p.warning) {
		const alerts = [];
		if (p.water.level < p.water.optimalMin) alerts.push("DORST");
		else if (p.water.level > p.water.optimalMax) alerts.push("te nat");
		if (p.light.level < p.light.optimalMin) alerts.push("te donker");
		else if (p.light.level > p.light.optimalMax) alerts.push("te licht");
		if (p.temperature.level < p.temperature.optimalMin) alerts.push("te koud");
		else if (p.temperature.level > p.temperature.optimalMax) alerts.push("te warm");
		message = alerts.join(", ") || "probleem";
	}
	return {
		id: p.id,
		name: p.nickname.split(" ").slice(1).join(" ") || p.nickname,
		type: p.type,
		warning: p.warning,
		message,
		image: p.image,
	};
});

const index = () => {
	const router = useRouter();

	const handleItemPress = (id: string) => {
		router.push(`/(garden)/garden?selectedPlantId=${id}`);
	};

	return (
		<StyledView>
			<StatusHeader items={HOME_PLANTS} onItemPress={handleItemPress} />
			<Spacer space={Styling.Spacing.med} />
			<StyledText type="head2" style={styles.head2}>
				Mijn tuin
			</StyledText>
			<CardContainer data={HOME_PLANTS} onItemPress={handleItemPress} style={{ marginBottom: 175 }} />
		</StyledView>
	);
};

export default index;

const styles = StyleSheet.create({
	head2: {
		alignSelf: "flex-start",
	},
});
