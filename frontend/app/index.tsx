import { StyleSheet } from "react-native";
import React from "react";
import StyledView from "../components/style/StyledView";
import StatusHeader from "../components/shared/home/statusHeader/StatusHeader";
import StyledText from "../components/style/StyledText";
import Spacer from "../components/style/Spacer";
import { Styling } from "../constants/Styling";
import CardContainer from "../components/shared/vegetableCard/CardContainer";

const index = () => {
	const myPlants = [
		{ id: "1", name: "Toby", type: "Tomaat", warning: false, message: "niks nodig", image: require("../assets/vegetables/tomato.png") },
		{ id: "2", name: "Kevin", type: "Kool", warning: true, message: "DORST", image: require("../assets/vegetables/cabbage.png") },
		{ id: "3", name: "Toby", type: "Tomaat", warning: false, message: "niks nodig", image: require("../assets/vegetables/tomato.png") },
		{ id: "4", name: "Kevin", type: "Kool", warning: true, message: "DORST", image: require("../assets/vegetables/cabbage.png") },
		{ id: "5", name: "Toby", type: "Tomaat", warning: false, message: "niks nodig", image: require("../assets/vegetables/tomato.png") },
		{ id: "6", name: "Kevin", type: "Kool", warning: true, message: "DORST", image: require("../assets/vegetables/cabbage.png") },
	];

	return (
		<StyledView safe>
			<StatusHeader items={myPlants} />
			<Spacer space={Styling.Spacing.xxl}/>
			<StyledText type="head2" style={styles.head2}>Mijn tuin</StyledText>
			<CardContainer data={myPlants} />
		</StyledView>
	);
};

export default index; 

const styles = StyleSheet.create({
	head2: {
		alignSelf: "flex-start",
	},
});
