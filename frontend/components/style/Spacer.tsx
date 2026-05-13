import { View } from "react-native";
import React from "react";

const Spacer = ({ space }: { space: number }) => {
	return <View style={{ height: space }} />;
};

export default Spacer;
