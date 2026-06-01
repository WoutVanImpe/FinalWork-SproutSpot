import { StyleSheet, TouchableOpacity, View, ActivityIndicator, FlatList } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Styling } from "../../constants/Styling";
import StyledText from "../../components/style/StyledText";
import StyledIcon from "../../components/style/StyledIcon";
import Spacer from "../../components/style/Spacer";
import { getPlantById } from "../../services/plants";
import { getUserProbes } from "../../services/probes";
import type { PlantDetail } from "../../services/plants";
import type { ProbeInfo } from "../../services/probes";
import FlowLayout from "../../components/pages/explore/plantFlow/FlowLayout";
import ProbeIcon from "../../assets/icons/probe.svg";

const PlantStep4 = () => {
  const { vegId, name } = useLocalSearchParams<{ vegId: string; name: string }>();
  const [veg, setVeg] = useState<PlantDetail | null>(null);
  const [probes, setProbes] = useState<ProbeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExisting, setShowExisting] = useState(false);

  useFocusEffect(useCallback(() => { setShowExisting(false); }, []));

  useEffect(() => {
    if (!vegId) return;
    Promise.all([
      getPlantById(vegId),
      getUserProbes().catch(() => ({ data: [] })),
    ]).then(([vegRes, probesRes]) => {
      if (vegRes.data) setVeg(vegRes.data);
      setProbes(probesRes.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [vegId]);

  if (loading) return <FlowLayout title="Koppel je sonde" onBack={() => router.back()}><ActivityIndicator color={Styling.Colors.green} style={{ marginTop: 40 }} /></FlowLayout>;
  if (!veg) return null;

  const displayName = decodeURIComponent(name || "");
  const availableProbes = probes.filter((p) => p.state !== "paired");

  const handleSelectProbe = (probe: ProbeInfo) => {
    router.push(`/(garden)/garden?placementMode=true&vegId=${vegId}&name=${encodeURIComponent(displayName)}&probeId=${probe.id}`);
  };

  return (
    <FlowLayout title="Koppel je sonde" onBack={() => router.back()}>
      <View style={styles.content}>
        <StyledText type="paragh" style={styles.hint}>
          We hebben een sonde nodig om de groei van je {veg.name.toLowerCase()} te volgen.
        </StyledText>
        <Spacer space={Styling.Spacing.xlg} />

        {!showExisting ? (
          <>
            {availableProbes.length > 0 && (
              <>
                <TouchableOpacity style={styles.choiceBtn} onPress={() => setShowExisting(true)} activeOpacity={0.7}>
                  <StyledIcon Icon={ProbeIcon} size="med" fill={Styling.Colors.white} />
                  <StyledText type="head4" style={styles.choiceBtnText}>Ik heb al een sonde</StyledText>
                </TouchableOpacity>
                <Spacer space={Styling.Spacing.reg} />
              </>
            )}
            <TouchableOpacity style={styles.choiceBtn} onPress={() => router.push(`/(explore)/plant-step5?vegId=${vegId}&name=${encodeURIComponent(displayName)}`)} activeOpacity={0.7}>
              <StyledIcon Icon={ProbeIcon} size="med" fill={Styling.Colors.white} />
              <StyledText type="head4" style={styles.choiceBtnText}>Ik stel een nieuwe sonde in</StyledText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setShowExisting(false)} activeOpacity={0.7} style={styles.backLink}>
              <StyledText type="paragh" style={styles.backLinkText}>Terug</StyledText>
            </TouchableOpacity>
            <Spacer space={Styling.Spacing.sml} />
            <FlatList
              data={availableProbes}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.probeRow} onPress={() => handleSelectProbe(item)} activeOpacity={0.7}>
                  <View style={styles.probeInfo}>
                    <StyledIcon Icon={ProbeIcon} size="reg" fill={Styling.Colors.green} />
                    <StyledText type="paragh" style={styles.probeName}>{item.name}</StyledText>
                  </View>
                  <StyledText type="smParagh" style={styles.probeId}>{item.hardware_id}</StyledText>
                </TouchableOpacity>
              )}
            />
          </>
        )}
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
  choiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Styling.Spacing.reg,
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Styling.Colors.white,
    borderRadius: Styling.BorderRadius.reg,
    paddingHorizontal: Styling.Padding.lrg,
    paddingVertical: Styling.Padding.reg,
  },
  choiceBtnText: {
    color: Styling.Colors.white,
    flex: 1,
  },
  backLink: {
    alignSelf: "flex-start",
  },
  backLinkText: {
    color: Styling.Colors.green,
  },
  probeRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Styling.Padding.sml,
    borderBottomWidth: 1,
    borderBottomColor: Styling.Colors.darkGrey,
  },
  probeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Styling.Spacing.sml,
  },
  probeName: {
    color: Styling.Colors.white,
  },
  probeId: {
    color: Styling.Colors.lightGrey,
  },
});

export default PlantStep4;
