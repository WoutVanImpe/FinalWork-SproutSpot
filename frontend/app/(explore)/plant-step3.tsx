import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Styling } from "../../constants/Styling";
import StyledText from "../../components/style/StyledText";
import Spacer from "../../components/style/Spacer";
import { VEGETABLE_DETAILS } from "../../data/vegetables";
import FlowLayout from "../../components/pages/explore/plantFlow/FlowLayout";

const PlantStep3 = () => {
  const { vegId } = useLocalSearchParams<{ vegId: string }>();
  const veg = vegId ? VEGETABLE_DETAILS[vegId] : null;
  const [name, setName] = useState("");

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
