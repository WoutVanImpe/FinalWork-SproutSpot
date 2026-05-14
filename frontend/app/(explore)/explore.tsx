import { StyleSheet } from "react-native";
import React from "react";
import StyledView from "../../components/style/StyledView";
import ExploreHeader from "../../components/pages/explore/header/ExploreHeader";
import MonthlyCandidates from "../../components/pages/explore/carousel/MonthlyCandidates";
import VegetableList from "../../components/pages/explore/vegetableList/VegetableList";
import Spacer from "../../components/style/Spacer";
import { Styling } from "../../constants/Styling";

const allVegetables = [
	{ id: "1", name: "Tomaat", image: require("../../assets/vegetables/tomato.png") },
	{ id: "2", name: "Kool", image: require("../../assets/vegetables/cabbage.png") },
	{ id: "3", name: "Tomaat", image: require("../../assets/vegetables/tomato.png") },
	{ id: "4", name: "Kool", image: require("../../assets/vegetables/cabbage.png") },
	{ id: "5", name: "Tomaat", image: require("../../assets/vegetables/tomato.png") },
	{ id: "6", name: "Kool", image: require("../../assets/vegetables/cabbage.png") },
];

const candidates = allVegetables.slice(0, 5);

const Explore = () => {
	return (
		<StyledView>
			<ExploreHeader onButtonPress={() => {}} />
			<Spacer space={Styling.Spacing.xsm} />
			<MonthlyCandidates data={candidates} />
			<Spacer space={Styling.Spacing.reg} />
			<VegetableList data={allVegetables} />
		</StyledView>
	);
};

export default Explore;

const styles = StyleSheet.create({});
