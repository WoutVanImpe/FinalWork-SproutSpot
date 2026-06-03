import { StyleSheet, View, Animated, useWindowDimensions } from "react-native";
import React, { useRef, useEffect, useState } from "react";
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { scaled } from "../../constants/scale";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const EMPTY_SQUARE_PATHS = [
	"M37.0371 19C37.0371 17.8954 37.9325 17 39.0371 17H50.0741C51.1787 17 52.0741 17.8954 52.0741 19V32.037H37.0371V19Z",
	"M17 39.0371C17 37.9325 17.8954 37.0371 19 37.0371H30.037C31.1416 37.0371 32.037 37.9325 32.037 39.0371V52.0741H19C17.8954 52.0741 17 51.1787 17 50.0741V39.0371Z",
	"M57.0742 39.0371C57.0742 37.9325 57.9696 37.0371 59.0742 37.0371H70.1113C71.2158 37.0371 72.1113 37.9325 72.1113 39.0371V50.0741C72.1113 51.1787 71.2158 52.0741 70.1113 52.0741H57.0742V39.0371Z",
	"M17 70.1113C17 71.2159 17.8954 72.1113 19 72.1113H30.037C31.1416 72.1113 32.037 71.2159 32.037 70.1113V57.0743H19C17.8954 57.0743 17 57.9697 17 59.0743V70.1113Z",
	"M37.0371 70.1113C37.0371 71.2159 37.9325 72.1113 39.0371 72.1113H50.0741C51.1787 72.1113 52.0741 71.2159 52.0741 70.1113V57.0743H37.0371V70.1113Z",
];

const FILLED_SQUARE_PATHS = [
	"M17 18C17 17.4477 17.4477 17 18 17H30.037C31.1416 17 32.037 17.8954 32.037 19V32.037H19C17.8954 32.037 17 31.1416 17 30.037V18Z",
	"M57.0742 19C57.0742 17.8954 57.9696 17 59.0742 17H71.1113C71.6635 17 72.1113 17.4477 72.1113 18V30.037C72.1113 31.1416 71.2158 32.037 70.1113 32.037H57.0742V19Z",
	"M37.0371 39.0371C37.0371 37.9325 37.9325 37.0371 39.0371 37.0371H52.0741V50.0741C52.0741 51.1787 51.1787 52.0741 50.0741 52.0741H37.0371V39.0371Z",
	"M57.0742 57.0742H70.1113C71.2158 57.0742 72.1113 57.9696 72.1113 59.0742V71.1113C72.1113 71.6635 71.6635 72.1113 71.1113 72.1113H59.0742C57.9696 72.1113 57.0742 71.2158 57.0742 70.1113V57.0742Z",
];

const LoadingScreen = ({ visible }: { visible: boolean }) => {
	const { height: screenHeight } = useWindowDimensions();
	const translateY = useRef(new Animated.Value(screenHeight)).current;
	const [mounted, setMounted] = useState(false);
	const wasVisible = useRef(false);

	useEffect(() => {
		if (visible && !wasVisible.current) {
			setMounted(true);
			translateY.setValue(screenHeight);
			const frame = requestAnimationFrame(() => {
				Animated.timing(translateY, {
					toValue: 0,
					duration: 500,
					useNativeDriver: true,
				}).start();
			});
			wasVisible.current = true;
			return () => cancelAnimationFrame(frame);
		}

		if (!visible && wasVisible.current) {
			Animated.timing(translateY, {
				toValue: -screenHeight,
				duration: 500,
				useNativeDriver: true,
			}).start(({ finished }) => {
				if (finished) setMounted(false);
			});
			wasVisible.current = false;
		}
	}, [visible, screenHeight, translateY]);

	const fillAnims = useRef(EMPTY_SQUARE_PATHS.map(() => new Animated.Value(0))).current;

	useEffect(() => {
		if (!mounted) return;

		const fills = fillAnims.map((anim) =>
			Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true })
		);
		const unfills = fillAnims.map((anim) =>
			Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true })
		);

		const animation = Animated.loop(
			Animated.sequence([
				Animated.stagger(200, fills),
				Animated.stagger(200, unfills),
			])
		);
		animation.start();

		return () => animation.stop();
	}, [mounted]);

	if (!mounted) return null;

	return (
		<Animated.View
			style={[styles.overlay, { transform: [{ translateY }] }]}
		>
			<Svg width={120} height={120} viewBox="0 0 89 89">
				<Defs>
					<LinearGradient id="bgGrad" x1="82.3744" y1="-5.48033e-07" x2="6.62559" y2="89" gradientUnits="userSpaceOnUse">
						<Stop stopColor="#3E4348" />
						<Stop offset="1" stopColor="#666C72" />
					</LinearGradient>
				</Defs>

				<Rect width="89" height="89" rx="18" fill="url(#bgGrad)" />

				{FILLED_SQUARE_PATHS.map((d, i) => (
					<Path
						key={`filled-${i}`}
						d={d}
						fill="#00CA68"
						stroke="#00CA68"
						strokeWidth="3"
					/>
				))}

				{EMPTY_SQUARE_PATHS.map((d, i) => (
					<React.Fragment key={`empty-${i}`}>
						<Path d={d} fill="none" stroke="white" strokeWidth="3" />
						<AnimatedPath
							d={d}
							fill="#00CA68"
							stroke="#00CA68"
							strokeWidth="3"
							opacity={fillAnims[i]}
						/>
					</React.Fragment>
				))}
			</Svg>
		</Animated.View>
	);
};

export default LoadingScreen;

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "#3E4348",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 999,
		elevation: 999,
	},
});

