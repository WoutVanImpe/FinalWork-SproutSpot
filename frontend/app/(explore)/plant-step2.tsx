import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Styling } from "../../constants/Styling";
import StyledText from "../../components/style/StyledText";
import Spacer from "../../components/style/Spacer";
import { getPlantById } from "../../services/plants";
import type { PlantDetail } from "../../services/plants";
import FlowLayout from "../../components/pages/explore/plantFlow/FlowLayout";

const PlantStep2 = () => {
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

  if (loading) return <FlowLayout title="Zaaien" onBack={() => router.push(`/(explore)/plant-step1?vegId=${vegId}`)}><ActivityIndicator color={Styling.Colors.green} style={{ marginTop: 40 }} /></FlowLayout>;
  if (!veg) return null;

  const steps = [
    `Vul je pot tot 2 cm onder de rand met potgrond. Druk de grond niet aan.`,
    `Maak een gaatje in de grond van ${veg.sowingDepth} diep. Hou ${veg.sowingDistance} afstand tussen de gaatjes of 1 per pot.`,
    `Leg het zaadje in het gat. Dek het zaadje af met een dun laagje grond.`,
  ];

  return (
    <FlowLayout title={`${veg.name} zaaien`} onBack={() => router.push(`/(explore)/plant-step1?vegId=${vegId}`)}>
      <View style={styles.content}>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepBlock}>
            <StyledText type="head3" style={styles.stepTitle}>Stap {i + 1}</StyledText>
            <StyledText type="paragh" style={styles.stepDesc}>{step}</StyledText>
          </View>
        ))}
        <Spacer space={Styling.Spacing.xlg} />
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.push(`/(explore)/plant-step3?vegId=${vegId}`)}
          activeOpacity={0.7}
        >
          <StyledText type="head4" style={{ color: Styling.Colors.white }}>Klaar!</StyledText>
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
  stepBlock: {
    width: "100%",
    paddingVertical: Styling.Padding.sml,
  },
  stepTitle: {
    color: Styling.Colors.white,
    marginBottom: Styling.Spacing.xsm,
  },
  stepDesc: {
    color: Styling.Colors.white,
    lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: Styling.Colors.green,
    borderRadius: Styling.BorderRadius.reg,
    paddingHorizontal: Styling.Padding.lrg,
    paddingVertical: Styling.Padding.sml,
  },
});

export default PlantStep2;
