import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ReactNode } from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import Spacer from "../../../style/Spacer";
import BackIcon from "../../../../assets/icons/undo.svg";

interface Props {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

const FlowLayout = ({ title, onBack, children }: Props) => (
  <StyledView>
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerBack} onPress={onBack}>
        <StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
      </TouchableOpacity>
      <StyledText type="head1" style={styles.headerTitle}>{title}</StyledText>
    </View>
    <Spacer space={Styling.Spacing.med} />
    {children}
  </StyledView>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    paddingVertical: Styling.Padding.reg,
  },
  headerTitle: {
    color: Styling.Colors.white,
    textAlign: "center",
    textAlignVertical: "center",
    flexShrink: 1,
    paddingLeft: 50,
    paddingRight: 50,
  },
  headerBack: {
    position: "absolute",
    left: 0,
    zIndex: 1,
  },
});

export default FlowLayout;
