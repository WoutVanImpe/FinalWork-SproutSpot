import { useWindowDimensions, StyleSheet, View, ViewStyle } from "react-native";
import React from "react";
import Svg, { Path } from "react-native-svg";
import { Styling } from "../../constants/Styling";
import { scaled } from "../../constants/scale";

const WAVE_VIEWBOX = "0 0 1284 256";
const WAVE_PATH =
  "M235 40.7409 C150.17 18.6112 46.1667 39.7409 4 55.7409 L15.5 216.241 C61.8333 199.741 136 168.241 235 203.741 C318.396 233.646 512 243.241 627 198.741 C722.933 161.619 871.5 157.741 948.5 192.241 C1076 249.367 1193.5 249.741 1276 229.241 C1282.17 161.407 1285.5 33.0405 1249.5 62.2409 C1204.5 98.7413 1046.5 85.2411 946.5 37.7413 C832.781 -16.2753 705.832 -9.66491 602.5 40.7409 C520.5 80.7408 373 76.7409 235 40.7409 Z";

const WaveShape = ({ fill, style, waveHeight, waveWidth }: { fill: string; style?: ViewStyle; waveHeight: number; waveWidth: number }) => (
  <View style={style}>
    <Svg width={waveWidth} height={waveHeight} viewBox={WAVE_VIEWBOX} preserveAspectRatio="none">
      <Path d={WAVE_PATH} fill={fill} transform={`translate(1284, 0) scale(-1, 1) rotate(5 642 128)`} />
    </Svg>
  </View>
);

interface Props {
  leftOffset?: number;
  waveHeight?: number;
  widthMultiplier?: number;
  style?: ViewStyle;
}

const WaveBackground = ({ leftOffset, waveHeight = scaled(300), widthMultiplier = 4, style }: Props) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const WAVE_W = SCREEN_WIDTH * widthMultiplier;
  const offset = leftOffset ?? -SCREEN_WIDTH - scaled(75);

  const svgWrapperStyle: ViewStyle = {
    position: "absolute",
    top: 0,
    left: offset,
    ...style,
  };

  return (
    <View style={svgWrapperStyle}>
      <View style={styles.shadowLayer2}>
        <WaveShape fill="#000" waveHeight={waveHeight} waveWidth={WAVE_W} />
      </View>
      <View style={styles.shadowLayer1}>
        <WaveShape fill="#000" waveHeight={waveHeight} waveWidth={WAVE_W} />
      </View>
      <WaveShape fill={Styling.Colors.green} waveHeight={waveHeight} waveWidth={WAVE_W} />
    </View>
  );
};

const styles = StyleSheet.create({
  shadowLayer1: {
    position: "absolute",
    top: 3,
    left: 0,
    opacity: 0.15,
  },
  shadowLayer2: {
    position: "absolute",
    top: 5,
    left: 0,
    opacity: 0.08,
  },
});

export default WaveBackground;
