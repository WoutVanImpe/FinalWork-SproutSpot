import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Styling } from "../../constants/Styling";
import StyledText from "../../components/style/StyledText";
import Spacer from "../../components/style/Spacer";
import { getPlantById } from "../../services/plants";
import type { PlantDetail } from "../../services/plants";
import FlowLayout from "../../components/pages/explore/plantFlow/FlowLayout";

const PlantStep4 = () => {
  const { vegId, name } = useLocalSearchParams<{ vegId: string; name: string }>();
  const [veg, setVeg] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vegId) return;
    getPlantById(vegId)
      .then((res) => { if (res.data) setVeg(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [vegId]);

  if (loading) return <FlowLayout title="Koppel je sonde" onBack={() => router.push(`/(explore)/plant-step3?vegId=${vegId}`)}><ActivityIndicator color={Styling.Colors.green} style={{ marginTop: 40 }} /></FlowLayout>;
  if (!veg) return null;

  const displayName = decodeURIComponent(name || "");

  return (
    <FlowLayout title="Koppel je sonde" onBack={() => router.push(`/(explore)/plant-step3?vegId=${vegId}`)}>
      <View style={styles.content}>
        <StyledText type="paragh" style={styles.hint}>
          We hebben een sonde nodig om de groei van je {veg.name.toLowerCase()} te volgen. We gaan je nu stap voor stap helpen met het instellen.
        </StyledText>
        <Spacer space={Styling.Spacing.xlg} />
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => router.push(`/(explore)/plant-step5?vegId=${vegId}&name=${encodeURIComponent(displayName)}`)}
          activeOpacity={0.7}
        >
          <StyledText type="head4" style={{ color: Styling.Colors.white }}>Start instellen</StyledText>
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
  hint: {
    color: Styling.Colors.white,
    textAlign: "center",
    lineHeight: 22,
  },
  nextBtn: {
    backgroundColor: Styling.Colors.green,
    borderRadius: Styling.BorderRadius.reg,
    paddingHorizontal: Styling.Padding.lrg,
    paddingVertical: Styling.Padding.sml,
  },
});

export default PlantStep4;
