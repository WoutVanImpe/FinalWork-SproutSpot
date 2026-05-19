import { StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Styling } from "../../constants/Styling";
import StyledText from "../../components/style/StyledText";
import Spacer from "../../components/style/Spacer";
import { getPlantById } from "../../services/plants";
import type { PlantDetail } from "../../services/plants";
import FlowLayout from "../../components/pages/explore/plantFlow/FlowLayout";

const PlantStep3 = () => {
  const { vegId } = useLocalSearchParams<{ vegId: string }>();
  const [veg, setVeg] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useFocusEffect(useCallback(() => { setName(""); }, []));

  useEffect(() => {
    if (!vegId) return;
    getPlantById(vegId)
      .then((res) => { if (res.data) setVeg(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [vegId]);

  if (loading) return <FlowLayout title="Geef je plant een naam" onBack={() => router.push(`/(explore)/plant-step2?vegId=${vegId}`)}><ActivityIndicator color={Styling.Colors.green} style={{ marginTop: 40 }} /></FlowLayout>;
  if (!veg) return null;

  const canContinue = name.trim().length > 0;

  return (
    <FlowLayout title="Geef je plant een naam" onBack={() => router.push(`/(explore)/plant-step2?vegId=${vegId}`)}>
      <View style={styles.content}>
        <StyledText type="paragh" style={styles.hint}>
          Kies een leuke naam voor je {veg.name.toLowerCase()}
        </StyledText>
        <Spacer space={Styling.Spacing.reg} />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={`Mijn ${veg.name.toLowerCase()}`}
          placeholderTextColor={Styling.Colors.lightGrey}
          maxLength={30}
        />
        <Spacer space={Styling.Spacing.xlg} />
        <TouchableOpacity
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
          onPress={() => canContinue && router.push(`/(explore)/plant-step4?vegId=${vegId}&name=${encodeURIComponent(name.trim())}`)}
          disabled={!canContinue}
          activeOpacity={0.7}
        >
          <StyledText type="head4" style={{ color: canContinue ? Styling.Colors.white : Styling.Colors.lightGrey }}>
            Volgende
          </StyledText>
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
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: Styling.Colors.white,
    borderRadius: Styling.BorderRadius.reg,
    paddingHorizontal: Styling.Padding.reg,
    paddingVertical: Styling.Padding.sml,
    color: Styling.Colors.white,
    fontFamily: Styling.Fonts.Family.bold,
    fontSize: Styling.Fonts.Size.reg,
  },
  nextBtn: {
    backgroundColor: Styling.Colors.green,
    borderRadius: Styling.BorderRadius.reg,
    paddingHorizontal: Styling.Padding.lrg,
    paddingVertical: Styling.Padding.sml,
  },
  nextBtnDisabled: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Styling.Colors.lightGrey,
  },
});

export default PlantStep3;
