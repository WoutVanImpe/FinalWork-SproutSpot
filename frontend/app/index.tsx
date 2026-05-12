import { StyleSheet } from "react-native";
import React from "react";
import StyledView from "../components/style/StyledView";
import StyledText from "../components/style/StyledText";
import StyledButton from "../components/style/StyledButton";
import StyledIcon from "../components/style/StyledIcon";
import GardenIcon from "../assets/icons/garden.svg"
import { Styling } from "../constants/Styling";

const index = () => {
	return (
		<StyledView safe>
			<StyledText type="head1">Index</StyledText>
			<StyledButton>Test</StyledButton>
		</StyledView>
	);
};

export default index;

const styles = StyleSheet.create({});
