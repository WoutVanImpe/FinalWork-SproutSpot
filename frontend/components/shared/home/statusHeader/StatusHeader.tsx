import { Dimensions, StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import React, { useState } from 'react'
import { Styling } from '../../../../constants/Styling';
import StyledText from '../../../style/StyledText';
import StyledIcon from '../../../style/StyledIcon';
import WaveBackground from '../../../../assets/svgs/woosh1.svg'
import ChevronLeft from '../../../../assets/icons/arrow_left.svg'
import ChevronRight from '../../../../assets/icons/arrow_right.svg'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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

const StatusHeader = ({ items }: StatusHeaderProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const currentItem = items[activeIndex];

    const nextItem = () => {
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    const prevItem = () => {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    if (!currentItem) return null;

    return (
        <View style={styles.container}>
            <View style={styles.svgWrapper}>
                <WaveBackground 
                    width={SCREEN_WIDTH * 1.2} 
                    height={270} 
                    preserveAspectRatio="none"
                />
            </View>

            <View style={styles.content}>
                <TouchableOpacity onPress={prevItem} style={styles.navButton}>
                    <StyledIcon Icon={ChevronLeft} fill={Styling.Colors.white} size="med" />
                </TouchableOpacity>

                <View style={styles.imageContainer}>
                    <Image source={currentItem.image} style={styles.plantImage} resizeMode="contain" />
                </View>

                <TouchableOpacity onPress={nextItem} style={styles.navButton}>
                    <StyledIcon Icon={ChevronRight} fill={Styling.Colors.white} size="med" />
                </TouchableOpacity>
            </View>

            <View style={styles.textContainer}>
                <StyledText type="head2" style={styles.statusText}>
                    {currentItem.type} {currentItem.name} heeft {currentItem.message}!
                </StyledText>
            </View>
        </View>
    )
}

export default StatusHeader

const styles = StyleSheet.create({
    container: {
        height: 320,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    svgWrapper: {
        position: 'absolute',
        top: 90,
        left: -SCREEN_WIDTH * 0.1,
        zIndex: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        zIndex: 2,
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