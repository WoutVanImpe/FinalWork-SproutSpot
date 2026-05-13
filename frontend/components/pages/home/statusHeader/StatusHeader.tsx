import { Animated, Dimensions, PanResponder, StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Styling } from '../../../../constants/Styling';
import StyledText from '../../../style/StyledText';
import StyledIcon from '../../../style/StyledIcon';
import ChevronLeft from '../../../../assets/icons/arrow_left.svg'
import ChevronRight from '../../../../assets/icons/arrow_right.svg'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CONTENT_HEIGHT = 230;

const WAVE_W = SCREEN_WIDTH * 4;
const WAVE_H = 270;
const WAVE_VIEWBOX = '0 0 1284 256';

const WAVE_REST =
  'M235 40.7409 C150.17 18.6112 46.1667 39.7409 4 55.7409 L15.5 216.241 C61.8333 199.741 136 168.241 235 203.741 C318.396 233.646 512 243.241 627 198.741 C722.933 161.619 871.5 157.741 948.5 192.241 C1076 249.367 1193.5 249.741 1276 229.241 C1282.17 161.407 1285.5 33.0405 1249.5 62.2409 C1204.5 98.7413 1046.5 85.2411 946.5 37.7413 C832.781 -16.2753 705.832 -9.66491 602.5 40.7409 C520.5 80.7408 373 76.7409 235 40.7409 Z';

interface CarouselItem {
    id: string;
    name: string; 
    type: string;
    warning: boolean;
    message: string;
    image: number | { uri: string };
}

interface StatusHeaderProps {
    items: CarouselItem[];
}

const WaveShape = ({ fill, d, style }: { fill: string; d: string; style?: any }) => (
    <View style={style}>
        <Svg width={WAVE_W} height={WAVE_H} viewBox={WAVE_VIEWBOX} preserveAspectRatio="none">
            <Path d={d} fill={fill} />
        </Svg>
    </View>
);

const CenterContent = ({ item }: { item: CarouselItem }) => (
    <>
        <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.plantImage} resizeMode="contain" />
        </View>
        <View style={styles.textContainer}>
            <StyledText type="head2" style={styles.statusText}>
                {item.type} {item.name} heeft {item.message}!
            </StyledText>
        </View>
    </>
);

const StatusHeader = ({ items }: StatusHeaderProps) => {
    const [displayIndex, setDisplayIndex] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const colorAnim = useRef(new Animated.Value(items[0]?.warning ? 1 : 0)).current;
    const isAnimating = useRef(false);
    const [transition, setTransition] = useState<{
        leaving: CarouselItem;
        entering: CarouselItem;
        direction: number;
    } | null>(null);

    const currentItem = items[displayIndex];

    const startTransition = useCallback((targetIndex: number, direction: number) => {
        if (isAnimating.current || targetIndex === displayIndex) return;
        isAnimating.current = true;

        setTransition({
            leaving: items[displayIndex],
            entering: items[targetIndex],
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

        const fromWarning = items[displayIndex].warning;
        const toWarning = items[targetIndex].warning;
        if (fromWarning !== toWarning) {
            Animated.timing(colorAnim, {
                toValue: toWarning ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [displayIndex, items, slideAnim, colorAnim]);

    const nextItem = () => {
        startTransition((displayIndex + 1) % items.length, -1);
    };

    const prevItem = () => {
        startTransition((displayIndex - 1 + items.length) % items.length, 1);
    };

    const swipeThreshold = 50;
    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gs) => {
            return Math.abs(gs.dx) > 20 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5;
        },
        onPanResponderRelease: (_, gs) => {
            if (isAnimating.current) return;
            if (gs.dx < -swipeThreshold) {
                startTransition((displayIndex + 1) % items.length, -1);
            } else if (gs.dx > swipeThreshold) {
                startTransition((displayIndex - 1 + items.length) % items.length, 1);
            }
        },
    }), [startTransition, displayIndex, items.length]);

    if (!currentItem) return null;

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
                <Animated.View style={{ position: 'absolute', top: 0, left: 0, opacity: colorAnim }}>
                    <WaveShape fill={Styling.Colors.red} d={WAVE_REST} />
                </Animated.View>
            </View>

            <View style={styles.contentRow}>
                <TouchableOpacity onPress={prevItem} style={styles.navButton}>
                    <StyledIcon Icon={ChevronLeft} fill={Styling.Colors.white} size="med" />
                </TouchableOpacity>

                <View style={styles.centerSlideArea} {...panResponder.panHandlers}>
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
                                <CenterContent item={transition.leaving} />
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
                                <CenterContent item={transition.entering} />
                            </Animated.View>
                        </>
                    ) : (
                        <CenterContent item={currentItem} />
                    )}
                </View>

                <TouchableOpacity onPress={nextItem} style={styles.navButton}>
                    <StyledIcon Icon={ChevronRight} fill={Styling.Colors.white} size="med" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default StatusHeader

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
        top: 35,
        left: -SCREEN_WIDTH + 60,
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
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        zIndex: 2,
    },
    centerSlideArea: {
        flex: 1,
        height: CONTENT_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slidePage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        
    },
    navButton: {
        marginTop: 80,
        zIndex: 10,
        borderRadius: 20,
    },
    imageContainer: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plantImage: {
        width: '90%',
        height: '90%',
        marginTop: -40,
    },
    textContainer: {
        marginTop: -10,
        paddingHorizontal: 40,
        zIndex: 2,
    },
    statusText: {
        fontFamily: Styling.Fonts.Family.bold,
        fontSize: 22,
        color: 'white',
        textAlign: 'center',
        lineHeight: 28,
    }
})