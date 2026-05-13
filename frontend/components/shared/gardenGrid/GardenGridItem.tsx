import { Image, StyleSheet } from "react-native";
import React from "react";

export interface GardenPlant {
    id: string;
    image: number | { uri: string };
    x: number;
    y: number;
}

const GardenGridItem = ({ plant }: { plant: GardenPlant }) => {
    return (
        <Image source={plant.image} style={styles.image} resizeMode="cover" />
    );
};

export default GardenGridItem;

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%",
    },
});
