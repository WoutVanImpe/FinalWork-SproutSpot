import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { Styling } from '../../../../constants/Styling';
import StyledText from '../../../style/StyledText';
import StyledButton from '../../../style/StyledButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const WAVE_W = SCREEN_WIDTH * 4;
const WAVE_H = 300;
const WAVE_VIEWBOX = '0 0 1284 256';

const WAVE_REST =
  'M235 40.7409 C150.17 18.6112 46.1667 39.7409 4 55.7409 L15.5 216.241 C61.8333 199.741 136 168.241 235 203.741 C318.396 233.646 512 243.241 627 198.741 C722.933 161.619 871.5 157.741 948.5 192.241 C1076 249.367 1193.5 249.741 1276 229.241 C1282.17 161.407 1285.5 33.0405 1249.5 62.2409 C1204.5 98.7413 1046.5 85.2411 946.5 37.7413 C832.781 -16.2753 705.832 -9.66491 602.5 40.7409 C520.5 80.7408 373 76.7409 235 40.7409 Z';

interface ExploreHeaderProps {
    onButtonPress: () => void;
}

const WaveShape = ({ fill, d, style }: { fill: string; d: string; style?: any }) => (
    <View style={style}>
        <Svg width={WAVE_W} height={WAVE_H} viewBox={WAVE_VIEWBOX} preserveAspectRatio="none">
            <Path d={d} fill={fill} transform={`translate(1284, 0) scale(-1, 1) rotate(0 642 128)`} />
        </Svg>
    </View>
);

const ExploreHeader = ({ onButtonPress }: ExploreHeaderProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.svgWrapper}>
                <View style={styles.shadowLayer2}>
                    <WaveShape fill="#000" d={WAVE_REST} />
                </View>
                <View style={styles.shadowLayer1}>
                    <WaveShape fill="#000" d={WAVE_REST} />
                </View>
                <WaveShape fill={Styling.Colors.green} d={WAVE_REST} />
            </View>

            <View style={styles.content}>
                <StyledText type="head1" style={styles.title}>
                    Vind de ideale match!
                </StyledText>
                <TouchableOpacity onPress={onButtonPress}>
                    <StyledButton inverted>
                        Zoeken
                    </StyledButton>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ExploreHeader

const styles = StyleSheet.create({
    container: {
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    svgWrapper: {
        position: 'absolute',
        top: 28,
        left: -SCREEN_WIDTH - 70,
        zIndex: 1,
    },
    shadowLayer1: {
        position: 'absolute',
        top: 3,
        left: 0,
        opacity: 0.15,
    },
    shadowLayer2: {
        position: 'absolute',
        top: 5,
        left: 0,
        opacity: 0.08,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        gap: Styling.Spacing.reg,
    },
    title: {
        color: Styling.Colors.white,
        textAlign: 'center',
        width: 300,
        lineHeight: 40,
    },
})
