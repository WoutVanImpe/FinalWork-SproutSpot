import { Animated, PanResponder, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Styling } from "../../constants/Styling";
import { scaled } from "../../constants/scale";
import StyledText from "../style/StyledText";
import StyledIcon from "../style/StyledIcon";
import { StatusBar } from "expo-status-bar";
import SwipeLeft from "../../assets/icons/swipe_left.svg";
import { OnboardingSlide, slides } from "../../data/onboardingSlides";
import OnboardingSlideContent from "./OnboardingSlide";
import DotIndicator from "../shared/DotIndicator";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OnboardingCarouselProps {
	onComplete: () => void;
}

const OnboardingCarousel = ({ onComplete }: OnboardingCarouselProps) => {
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const [displayIndex, setDisplayIndex] = useState(0);
	const slideAnim = useRef(new Animated.Value(0)).current;
	const isAnimating = useRef(false);
	const [transition, setTransition] = useState<{
		leaving: OnboardingSlide;
		entering: OnboardingSlide;
		direction: number;
	} | null>(null);

	const currentSlide = slides[displayIndex];

	const startTransition = useCallback(
		(targetIndex: number, direction: number) => {
			if (isAnimating.current || targetIndex === displayIndex) return;
			isAnimating.current = true;

			setTransition({
				leaving: slides[displayIndex],
				entering: slides[targetIndex],
				direction,
			});

			slideAnim.setValue(0);

			Animated.timing(slideAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				setDisplayIndex(targetIndex);
				setTransition(null);
				isAnimating.current = false;
			});
		},
		[displayIndex, slideAnim],
	);

	const [showArrow, setShowArrow] = useState(false);
	const arrowAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (displayIndex !== 0) {
			setShowArrow(false);
			arrowAnim.setValue(0);
			return;
		}
		const timeout = setTimeout(() => {
			setShowArrow(true);
			const loop = Animated.loop(
				Animated.sequence([
					Animated.timing(arrowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
					Animated.timing(arrowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
				]),
			);
			loop.start();
			return () => loop.stop();
		}, 5000);
		return () => clearTimeout(timeout);
	}, [displayIndex, arrowAnim]);

	const swipeThreshold = scaled(50);
	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => false,
				onMoveShouldSetPanResponder: (_, gs) => {
					return Math.abs(gs.dx) > 20 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5;
				},
				onPanResponderRelease: (_, gs) => {
					if (isAnimating.current) return;
					if (gs.dx < -swipeThreshold && displayIndex < slides.length - 1) {
						startTransition(displayIndex + 1, -1);
					} else if (gs.dx > swipeThreshold && displayIndex > 0) {
						startTransition(displayIndex - 1, 1);
					}
				},
			}),
		[startTransition, displayIndex],
	);

	if (!currentSlide) return null;

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			{transition ? (
				<>
					<Animated.View
						style={[
							styles.slidePage,
							{
								opacity: slideAnim.interpolate({
									inputRange: [0, 0.6, 1],
									outputRange: [1, 0, 0],
								}),
								transform: [
									{
										translateX: slideAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [0, transition.direction * SCREEN_WIDTH],
										}),
									},
								],
							},
						]}
					>
						<OnboardingSlideContent slide={transition.leaving} onComplete={onComplete} />
					</Animated.View>
					<Animated.View
						style={[
							styles.slidePage,
							{
								opacity: slideAnim.interpolate({
									inputRange: [0, 0.4, 1],
									outputRange: [0, 0, 1],
								}),
								transform: [
									{
										translateX: slideAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [transition.direction * -SCREEN_WIDTH, 0],
										}),
									},
								],
							},
						]}
					>
						<OnboardingSlideContent slide={transition.entering} onComplete={onComplete} />
					</Animated.View>
				</>
			) : (
				<View style={styles.slidePage} {...panResponder.panHandlers}>
					<OnboardingSlideContent slide={currentSlide} onComplete={onComplete} />
				</View>
			)}

			{displayIndex === 0 && (
				<View style={styles.topBar}>
					<TouchableOpacity onPress={onComplete} style={styles.skipButton} activeOpacity={0.7}>
						<StyledText type="smParagh" fullCap style={{ color: "rgba(255,255,255,0.7)" }}>
							Overslaan
						</StyledText>
					</TouchableOpacity>
				</View>
			)}

			<View style={[styles.bottomBar, { bottom: insets.bottom + scaled(20) }]}>
				<DotIndicator count={slides.length} activeIndex={displayIndex} />
			</View>
			{showArrow && (
				<View style={styles.arrowWrapper} pointerEvents="none">
					<Animated.View style={{ transform: [{ translateX: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) }] }}>
						<StyledIcon Icon={SwipeLeft} fill={Styling.Colors.white} size="med" />
					</Animated.View>
				</View>
			)}
		</View>
	);
};

export default OnboardingCarousel;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Styling.Colors.black,
	},
	slidePage: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	topBar: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "flex-end",
		paddingTop: scaled(60),
		paddingHorizontal: scaled(24),
	},
	skipButton: {
		paddingVertical: scaled(4),
		paddingHorizontal: scaled(8),
	},
	bottomBar: {
		position: "absolute",
		left: 0,
		right: 0,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	arrowWrapper: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "flex-end",
		paddingRight: scaled(24),
	},
});


