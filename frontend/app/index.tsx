import { StyleSheet } from "react-native";
import React from "react";
import StyledView from "../components/style/StyledView";
import StyledText from "../components/style/StyledText";
import StyledButton from "../components/style/StyledButton";
import StatusHeader from "../components/shared/home/statusHeader/StatusHeader";

const index = () => {
	const myPlants = [
		{ id: "1", name: "Toby", type: "Tomaat", warning: false, message: "niks nodig", image: require("../assets/vegetables/tomato.png") },
		{ id: "2", name: "Babs", type: "Basilicum", warning: true, message: "DORST", image: require("../assets/vegetables/cabbage.png") },
	];

	return (
		<StyledView safe>
			<StyledText type="head1">Index</StyledText>
			<StyledButton>Test</StyledButton>
			<StatusHeader items={myPlants} />
		</StyledView>
	);
};

export default index;

const styles = StyleSheet.create({});
