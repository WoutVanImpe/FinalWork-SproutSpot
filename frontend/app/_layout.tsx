import { StyleSheet, View, TouchableOpacity, useWindowDimensions } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { useFonts } from "expo-font";
import Svg, { Path } from "react-native-svg";
import { Styling } from "../constants/Styling";
import StyledIcon from "../components/style/StyledIcon";
import HomeIcon from "../assets/icons/home.svg";
import GardenIcon from "../assets/icons/garden.svg";
import ExploreIcon from "../assets/icons/explore.svg";

const BAR_HEIGHT = 65;
const BAR_MARGIN = 20;
const TAB_WIDTH = 64;
const TAB_GAP = 32;
const CORNER_RADIUS = 24;
const SCOOP_RADIUS = 40;
const SCOOP_DEPTH = 48;

const routeIcons: Record<string, React.FC<any>> = {
	index: HomeIcon,
	"(garden)/garden": GardenIcon,
	"(explore)/explore": ExploreIcon,
};

const routeOrder = ["index", "(garden)/garden", "(explore)/explore"];

const CurvedBackground = ({ width, activeIndex }: { width: number; activeIndex: number }) => {
    const totalTabsWidth = TAB_WIDTH * 3 + TAB_GAP * 2;
    const startOffset = (width - totalTabsWidth) / 2;
    const cx = startOffset + TAB_WIDTH / 2 + activeIndex * (TAB_WIDTH + TAB_GAP);
    
    const r = SCOOP_RADIUS;
    const d = SCOOP_DEPTH;
    const s = 16;
    const v = 4;

    const path = [
        `M ${CORNER_RADIUS} 0`,
        `L ${cx - r - s} 0`, 
        `C ${cx - r - s + 10} 0, ${cx - r} 0, ${cx - r} ${v}`,
        `C ${cx - r} ${d}, ${cx + r} ${d}, ${cx + r} ${v}`,
        `C ${cx + r} 0, ${cx + r + s - 10} 0, ${cx + r + s} 0`,
        `L ${width - CORNER_RADIUS} 0`,
        `Q ${width} 0, ${width} ${CORNER_RADIUS}`,
        `L ${width} ${BAR_HEIGHT - CORNER_RADIUS}`,
        `Q ${width} ${BAR_HEIGHT}, ${width - CORNER_RADIUS} ${BAR_HEIGHT}`,
        `L ${CORNER_RADIUS} ${BAR_HEIGHT}`,
        `Q 0 ${BAR_HEIGHT}, 0 ${BAR_HEIGHT - CORNER_RADIUS}`,
        `L 0 ${CORNER_RADIUS}`,
        `Q 0 0, ${CORNER_RADIUS} 0`,
        `Z`,
    ].join(" ");

    return (
        <Svg width={width} height={BAR_HEIGHT} style={styles.svg}>
            <Path d={path} fill={Styling.Colors.white} />
        </Svg>
    );
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const barWidth = SCREEN_WIDTH - BAR_MARGIN * 2;
	const activeIndex = state.index;

	const visibleRoutes = state.routes.filter((r: any) => routeOrder.includes(r.name));

	return (
		<View style={[styles.wrapper, { width: SCREEN_WIDTH }]}>
			<CurvedBackground width={barWidth} activeIndex={activeIndex} />
			<View style={[styles.bar, { width: barWidth }]}>
				{visibleRoutes.map((route: any, index: number) => {
					const isFocused = state.index === index;

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});
						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					const Icon = routeIcons[route.name];

					return (
						<TouchableOpacity
							key={route.key}
							onPress={onPress}
							activeOpacity={1}
							style={[styles.tabContainer, { width: TAB_WIDTH }]}
						>
							<View style={isFocused ? styles.activeBtn : styles.inactiveBtn}>
								{isFocused && <View style={styles.focusedCircle} />}
								<StyledIcon
									Icon={Icon}
									fill={isFocused ? Styling.Colors.white : Styling.Colors.lightGrey}
									size="med"
								/>
							</View>
						</TouchableOpacity>
					);
				})}
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
			screenOptions={{
				headerShown: false,
			}}
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
	svg: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
	},
	bar: {
		position: "absolute",
		flexDirection: "row",
		height: BAR_HEIGHT,
		justifyContent: "center",
		gap: TAB_GAP,
	},
	tabContainer: {
		height: BAR_HEIGHT,
		justifyContent: "center",
		alignItems: "center",
	},
	inactiveBtn: {
		flex: 1,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	activeBtn: {
		width: 60,
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		top: -40,
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
