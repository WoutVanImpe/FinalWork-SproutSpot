import { Image, StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Styling } from "../../constants/Styling";
import StyledText from "../../components/style/StyledText";
import Spacer from "../../components/style/Spacer";
import { getPlantById } from "../../services/plants";
import type { PlantDetail } from "../../services/plants";
import FlowLayout from "../../components/pages/explore/plantFlow/FlowLayout";
import { scaled } from "../../constants/scale";

const PlantStep1 = () => {
  const { vegId } = useLocalSearchParams<{ vegId: string }>();
  const [veg, setVeg] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vegId) return;
    getPlantById(vegId)
      .then((res) => { if (res.data) setVeg(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [vegId]);

  if (loading) return <FlowLayout title="Klaar om te planten?" onBack={() => router.navigate("/(explore)/explore")}><ActivityIndicator color={Styling.Colors.green} style={{ marginTop: 40 }} /></FlowLayout>;
  if (!veg) return null;

  return (
    <FlowLayout title="Klaar om te planten?" onBack={() => router.navigate("/(explore)/explore")}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Image source={{ uri: veg.image }} style={styles.image} resizeMode="contain" />
          <View style={styles.itemsCol}>
            <StyledText type="head3" style={styles.itemsTitle}>Je hebt nodig:</StyledText>
            <Spacer space={Styling.Spacing.xsm} />
            <StyledText type="paragh" style={styles.itemText}>{veg.name.toLowerCase()}zaden</StyledText>
            <StyledText type="paragh" style={styles.itemText}>Pot (min. {veg.potDepth} diep)</StyledText>
            <StyledText type="paragh" style={styles.itemText}>Potgrond</StyledText>
            <StyledText type="paragh" style={styles.itemText}>Opgeladen sonde</StyledText>
          </View>
        </View>
        <Spacer space={Styling.Spacing.xlg} />
        <TouchableOpacity
          style={styles.yesBtn}
          onPress={() => router.push(`/(explore)/plant-step2?vegId=${vegId}`)}
          activeOpacity={0.7}
        >
          <StyledText type="head4" style={{ color: Styling.Colors.white }}>Ja, laten we gaan!</StyledText>
        </TouchableOpacity>
      </View>
    </FlowLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Styling.Padding.reg,
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    gap: Styling.Spacing.med,
    width: "100%",
    justifyContent: "center",
  },
  image: {
    width: 120,
    height: 120,
  },
  itemsCol: {
    justifyContent: "center",
  },
  itemsTitle: {
    color: Styling.Colors.white,
  },
  itemText: {
    color: Styling.Colors.white,
    paddingVertical: Styling.Padding.xsm,
  },
  yesBtn: {
    backgroundColor: Styling.Colors.green,
    borderRadius: Styling.BorderRadius.reg,
    paddingHorizontal: Styling.Padding.lrg,
    paddingVertical: Styling.Padding.sml,
  },
});

export default PlantStep1;

