import { StyleSheet, View, useWindowDimensions, Animated } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { useFonts } from "expo-font";
import CurvedBackground from "../components/shared/navbar/CurvedBackground";
import TabBarButton from "../components/shared/navbar/TabBarButton";
import {
	BAR_MARGIN,
	TAB_WIDTH,
	TAB_GAP,
	BAR_HEIGHT,
	routeIcons,
	routeOrder,
} from "../constants/tabConfig";

const CustomTabBar = ({ state, navigation }: any) => {
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const barWidth = SCREEN_WIDTH - BAR_MARGIN * 2;
	const activeIndex = state.index;

	const totalTabsWidth = TAB_WIDTH * 3 + TAB_GAP * 2;
	const startOffset = (barWidth - totalTabsWidth) / 2;
	const getCx = (i: number) => startOffset + TAB_WIDTH / 2 + i * (TAB_WIDTH + TAB_GAP);

	const animatedCx = useRef(new Animated.Value(getCx(0))).current;
	const [cx, setCx] = useState(getCx(0));

	const visibleRoutes = state.routes.filter((r: any) => routeOrder.includes(r.name));
	const tabAnims = useRef(visibleRoutes.map(() => new Animated.Value(0))).current;

	useEffect(() => {
		const listener = animatedCx.addListener(({ value }) => setCx(value));
		return () => animatedCx.removeListener(listener);
	}, []);

	useEffect(() => {
		Animated.spring(animatedCx, {
			toValue: getCx(activeIndex),
			useNativeDriver: false,
			friction: 8,
			tension: 40,
		}).start();
	}, [activeIndex]);

	useEffect(() => {
		tabAnims.forEach((anim: Animated.Value, i: number) => {
			Animated.spring(anim, {
				toValue: i === activeIndex ? 1 : 0,
				useNativeDriver: true,
				friction: 8,
				tension: 40,
			}).start();
		});
	}, [activeIndex]);

	return (
		<View style={[styles.wrapper, { width: SCREEN_WIDTH }]}>
			<CurvedBackground width={barWidth} cx={cx} />
			<View style={[styles.bar, { width: barWidth }]}>
				{visibleRoutes.map((route: any, index: number) => (
					<TabBarButton
						key={route.key}
						icon={routeIcons[route.name]}
						index={index}
						activeIndex={activeIndex}
						anim={tabAnims[index]}
						onPress={() => {
							const event = navigation.emit({
								type: "tabPress",
								target: route.key,
								canPreventDefault: true,
							});
							if (activeIndex !== index && !event.defaultPrevented) {
								navigation.navigate(route.name);
							}
						}}
					/>
				))}
			</View>
		</View>
	);
};

const Footer = () => {
	const [fontsLoaded] = useFonts({
		"SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
		"SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
	});

	if (!fontsLoaded) return null;

	return (
		<Tabs
			tabBar={(props) => <CustomTabBar {...props} />}
			screenOptions={{ headerShown: false }}
		>
			<Tabs.Screen name="index" />
			<Tabs.Screen name="(garden)/garden" />
			<Tabs.Screen name="(explore)/explore" />
			<Tabs.Screen name="(account)/account" options={{ href: null }} />
		</Tabs>
	);
};

export default Footer;

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
		bottom: 25,
		alignItems: "center",
	},
	bar: {
		position: "absolute",
		flexDirection: "row",
		height: BAR_HEIGHT,
		justifyContent: "center",
		gap: TAB_GAP,
	},
});
