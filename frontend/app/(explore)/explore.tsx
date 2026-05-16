import { StyleSheet } from "react-native";
import React from "react";
import { router } from "expo-router";
import StyledView from "../../components/style/StyledView";
import ExploreHeader from "../../components/pages/explore/header/ExploreHeader";
import MonthlyCandidates from "../../components/pages/explore/carousel/MonthlyCandidates";
import VegetableList from "../../components/pages/explore/vegetableList/VegetableList";
import Spacer from "../../components/style/Spacer";
import { Styling } from "../../constants/Styling";
import { VEGETABLES } from "../../data/vegetables";

const candidates = VEGETABLES;

const Explore = () => {
	const handleItemPress = (id: string) => {
		router.push(`/(explore)/vegetable-info?id=${id}`);
	};

	return (
		<StyledView>
			<ExploreHeader onButtonPress={() => router.push("/(explore)/plant-finder")} />
			<Spacer space={Styling.Spacing.xsm} />
			<MonthlyCandidates data={candidates} onItemPress={handleItemPress} />
			<Spacer space={Styling.Spacing.reg} />
			<VegetableList data={VEGETABLES} onItemPress={handleItemPress} />
		</StyledView>
	);
};

export default Explore;

const styles = StyleSheet.create({});
