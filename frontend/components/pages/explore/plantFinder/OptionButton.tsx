import { StyleSheet, TouchableOpacity } from "react-native";
import { Styling } from "../../../../constants/Styling";
import StyledText from "../../../style/StyledText";

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  small?: boolean;
}

const OptionButton = ({ label, selected, small, onPress }: Props) => (
  <TouchableOpacity
    style={[styles.btn, small && styles.btnSmall, selected && styles.btnSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <StyledText type="paragh" style={[styles.btnText, selected && styles.btnTextSelected]}>
      {label}
    </StyledText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    borderWidth: 1,
    borderColor: Styling.Colors.white,
    borderRadius: Styling.BorderRadius.reg,
    paddingVertical: Styling.Padding.sml,
    paddingHorizontal: Styling.Padding.reg,
    alignItems: "center",
  },
  btnSmall: {
    paddingVertical: Styling.Padding.xsm,
    paddingHorizontal: Styling.Padding.sml,
  },
  btnSelected: {
    backgroundColor: Styling.Colors.green,
    borderColor: Styling.Colors.green,
  },
  btnText: { color: Styling.Colors.white },
  btnTextSelected: { color: Styling.Colors.white },
});

export default OptionButton;
