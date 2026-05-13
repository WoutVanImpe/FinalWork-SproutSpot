import { StyleSheet } from "react-native";
import React from "react";
import StyledView from "../../components/style/StyledView";
import ExploreHeader from "../../components/pages/explore/header/ExploreHeader";

const Explore = () => {
	return (
		<StyledView safe>
			<ExploreHeader onButtonPress={() => {}} />
		</StyledView>
	);
};

export default Explore;

const styles = StyleSheet.create({});
