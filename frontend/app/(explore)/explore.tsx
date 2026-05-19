import { StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import StyledView from "../../components/style/StyledView";
import ExploreHeader from "../../components/pages/explore/header/ExploreHeader";
import MonthlyCandidates from "../../components/pages/explore/carousel/MonthlyCandidates";
import VegetableList from "../../components/pages/explore/vegetableList/VegetableList";
import Spacer from "../../components/style/Spacer";
import { Styling } from "../../constants/Styling";
import { getAllPlants } from "../../services/plants";
import type { PlantListItem } from "../../services/plants";
import type { VegetableInfo } from "../../data/vegetables";

const Explore = () => {
	const [plants, setPlants] = useState<PlantListItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getAllPlants()
			.then((res) => { if (res.data) setPlants(res.data); })
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const asCardData: VegetableInfo[] = plants.map((p) => ({
		id: p.id,
		name: p.name,
		image: { uri: p.image },
		placement: p.placement,
		sunlight: p.sunlight,
		sowingPeriod: p.sowingPeriod,
		careLevel: p.careLevel,
	}));

	const handleItemPress = (id: string) => {
		router.push(`/(explore)/vegetable-info?id=${id}`);
	};

	return (
		<StyledView>
			<ExploreHeader onButtonPress={() => router.push("/(explore)/plant-finder")} />
			{loading ? (
				<ActivityIndicator color={Styling.Colors.green} style={{ marginTop: 40 }} />
			) : (
				<>
					<Spacer space={Styling.Spacing.xsm} />
					<MonthlyCandidates data={asCardData} onItemPress={handleItemPress} />
					<Spacer space={Styling.Spacing.reg} />
					<VegetableList data={asCardData} onItemPress={handleItemPress} />
				</>
			)}
		</StyledView>
	);
};

export default Explore;

const styles = StyleSheet.create({});
