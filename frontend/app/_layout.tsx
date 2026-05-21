import { StyleSheet, View, useWindowDimensions, Animated } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { Tabs, useSegments, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import CurvedBackground from "../components/shared/navbar/CurvedBackground";
import TabBarButton from "../components/shared/navbar/TabBarButton";
import { BAR_MARGIN, TAB_WIDTH, TAB_GAP, BAR_HEIGHT, routeIcons, routeOrder } from "../constants/tabConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import NavHeader from "../components/shared/header/NavHeader";
import { OverlayProvider } from "../context/OverlayContext";
import { AuthProvider } from "../context/AuthContext";
import OnboardingCarousel from "../components/onboarding/OnboardingCarousel";
import AuthScreen from "../components/auth/AuthScreen";
import RegisterFlow from "../components/auth/RegisterFlow";
import LoadingScreen from "../components/shared/LoadingScreen";
import { useAuth } from "../context/AuthContext";

const CustomTabBar = ({ state, navigation }: any) => {
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const segments = useSegments();
	const barWidth = SCREEN_WIDTH - BAR_MARGIN * 2;
	const totalTabsWidth = TAB_WIDTH * 3 + TAB_GAP * 2;
	const startOffset = (barWidth - totalTabsWidth) / 2;
	const getCx = (i: number) => startOffset + TAB_WIDTH / 2 + i * (TAB_WIDTH + TAB_GAP);

	const animatedCx = useRef(new Animated.Value(getCx(0))).current;
	const [cx, setCx] = useState(getCx(0));

	const visibleRoutes = state.routes.filter((r: any) => routeOrder.includes(r.name));
	const tabAnims = useRef(visibleRoutes.map(() => new Animated.Value(0))).current;

	const visibleIndex = segments[0] === "(garden)" ? 1 : segments[0] === "(explore)" ? 2 : 0;
	const prevVisibleIndex = useRef(visibleIndex);

	useEffect(() => {
		const listener = animatedCx.addListener(({ value }) => setCx(value));
		return () => animatedCx.removeListener(listener);
	}, []);

	useEffect(() => {
		if (visibleIndex < 0) {
			prevVisibleIndex.current = visibleIndex;
			return;
		}
		if (prevVisibleIndex.current < 0) {
			animatedCx.setValue(getCx(visibleIndex));
		}
		Animated.spring(animatedCx, {
			toValue: getCx(visibleIndex),
			useNativeDriver: false,
			friction: 8,
			tension: 40,
		}).start();
		prevVisibleIndex.current = visibleIndex;
	}, [visibleIndex]);

	useEffect(() => {
		tabAnims.forEach((anim: Animated.Value, i: number) => {
			Animated.spring(anim, {
				toValue: i === visibleIndex ? 1 : 0,
				useNativeDriver: true,
				friction: 8,
				tension: 40,
			}).start();
		});
	}, [visibleIndex]);

	return (
		<View style={[styles.wrapper, { width: SCREEN_WIDTH, bottom: insets.bottom }]}>
			<CurvedBackground width={barWidth} cx={visibleIndex >= 0 ? cx : -999} />
			<View style={[styles.bar, { width: barWidth }]}>
				{visibleRoutes.map((route: any, index: number) => (
					<TabBarButton
						key={route.key}
						icon={routeIcons[route.name]}
						index={index}
						activeIndex={visibleIndex}
						anim={tabAnims[index]}
						onPress={() => {
							const event = navigation.emit({
								type: "tabPress",
								target: route.key,
								canPreventDefault: true,
							});
							if (event.defaultPrevented) return;
							const routeSeg0 = route.name.split("/")[0];
							const routeSeg1 = route.name.split("/")[1];
							const isOnTab = segments[0] === routeSeg0;
							const isSubPage = isOnTab && routeSeg1 !== undefined && segments.length > 1 && segments.at(1) !== routeSeg1;
							if (visibleIndex !== index) {
								navigation.navigate(route.name);
							} else if (isSubPage) {
								navigation.navigate(route.name);
							}
						}}
					/>
				))}
			</View>
		</View>
	);
};

const AppContent = () => {
	const [fontsLoaded] = useFonts({
		"SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
		"SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
	});
	const segments = useSegments();
	const isAccountPage = segments.includes("account");
	const [showOnboarding, setShowOnboarding] = useState(true);
	const [showAuth, setShowAuth] = useState(false);
	const [showRegisterFlow, setShowRegisterFlow] = useState(false);
	const [pendingPlant, setPendingPlant] = useState<{ vegId: string; name: string } | null>(null);
	const router = useRouter();
	const { loading, user } = useAuth();
	const isLoading = !fontsLoaded || loading;

	useEffect(() => {
		if (pendingPlant) {
			const { vegId, name } = pendingPlant;
			router.push(`/(garden)/garden?placementMode=true&vegId=${vegId}&name=${encodeURIComponent(name)}`);
			setPendingPlant(null);
		}
	}, [pendingPlant]);

	return (
		<View style={{ flex: 1 }}>
			{user ? (
				<OverlayProvider>
					<StatusBar style="light" />
					{!isAccountPage && <NavHeader />}
					<Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
						<Tabs.Screen name="index" />
						<Tabs.Screen name="(garden)/garden" />
						<Tabs.Screen name="(explore)/explore" />
						<Tabs.Screen name="(account)/account" options={{ href: null }} />
					</Tabs>
				</OverlayProvider>
			) : showOnboarding ? (
				<OnboardingCarousel onComplete={() => { setShowOnboarding(false); setShowAuth(true); }} />
			) : showAuth ? (
				<AuthScreen onComplete={(mode) => { setShowAuth(false); if (mode === "register") { setShowRegisterFlow(true); } }} />
			) : showRegisterFlow ? (
				<RegisterFlow onComplete={(vegId, name) => { setShowRegisterFlow(false); setPendingPlant({ vegId, name }); }} />
			) : (
				<View style={{ flex: 1, backgroundColor: "#3E4348" }} />
			)}
			<LoadingScreen visible={isLoading} />
		</View>
	);
};

const NavOverlay = () => (
	<AuthProvider>
		<AppContent />
	</AuthProvider>
);

export default NavOverlay;

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
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
