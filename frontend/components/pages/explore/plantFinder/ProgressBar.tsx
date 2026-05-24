import { StyleSheet, View } from "react-native";
import { Styling } from "../../../../constants/Styling";

interface Props {
  fraction: number;
}

const ProgressBar = ({ fraction }: Props) => (
  <View style={styles.bar}>
    <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
  </View>
);

const styles = StyleSheet.create({
  bar: {
    width: "50%",
    alignSelf: "center",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: Styling.Colors.green,
    borderRadius: 2,
  },
});

export default ProgressBar;
