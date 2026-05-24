import { StyleSheet, TouchableOpacity, Animated } from "react-native";
import React from "react";
import { Styling } from "../../../constants/Styling";
import StyledIcon from "../../style/StyledIcon";
import { TAB_WIDTH, BAR_HEIGHT } from "../../../constants/tabConfig";

const TabBarButton = ({
	icon: Icon,
	index,
	activeIndex,
	onPress,
	anim,
}: {
	icon: React.FC<any>;
	index: number;
	activeIndex: number;
	onPress: () => void;
	anim: Animated.Value;
}) => {
	const isFocused = activeIndex === index;

	const translateY = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -40],
	});
	const circleScale = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 1],
	});

	return (
		<TouchableOpacity onPress={onPress} activeOpacity={1} style={[styles.container, { width: TAB_WIDTH }]}>
			<Animated.View style={[styles.iconWrapper, { transform: [{ translateY }] }]}>
				<Animated.View
					style={[
						styles.focusedCircle,
						{ transform: [{ scale: circleScale }], opacity: circleScale },
					]}
				/>
				<StyledIcon
					Icon={Icon}
					fill={isFocused ? Styling.Colors.white : Styling.Colors.lightGrey}
					size="med"
				/>
			</Animated.View>
		</TouchableOpacity>
	);
};

export default TabBarButton;

const styles = StyleSheet.create({
	container: {
		height: BAR_HEIGHT,
		justifyContent: "center",
		alignItems: "center",
	},
	iconWrapper: {
		width: 60,
		height: 60,
		justifyContent: "center",
		alignItems: "center",
	},
	focusedCircle: {
		position: "absolute",
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: Styling.Colors.green,
		elevation: 8,
		shadowColor: Styling.Colors.green,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
	},
});
