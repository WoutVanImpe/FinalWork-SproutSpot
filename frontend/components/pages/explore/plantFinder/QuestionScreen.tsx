import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import Spacer from "../../../style/Spacer";
import BackIcon from "../../../../assets/icons/undo.svg";
import ProgressBar from "./ProgressBar";
import OptionButton from "./OptionButton";

interface Question {
  title: string;
  explanation: string;
  options: { label: string; value: string }[];
}

interface Props {
  question: Question;
  step: number;
  totalSteps: number;
  answer: string | null;
  onAnswer: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
}

const QuestionScreen = ({ question, step, totalSteps, answer, onAnswer, onNext, onBack, isLast }: Props) => {
  const canContinue = answer !== null;

  return (
    <StyledView>
      <ProgressBar fraction={step / (totalSteps - 1)} />

      <Spacer space={Styling.Spacing.reg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={onBack}>
          <StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
        </TouchableOpacity>
        <StyledText type="head1" style={styles.headerTitle}>{question.title}</StyledText>
      </View>

      <Spacer space={Styling.Spacing.med} />

      <View style={styles.contentPad}>
        <StyledText type="paragh" style={styles.explanation}>{question.explanation}</StyledText>

        <Spacer space={Styling.Spacing.reg} />

        {question.options.length > 6 ? (
          <View style={styles.monthGrid}>
            {question.options.map((opt) => (
              <View key={opt.value} style={styles.monthCell}>
                <OptionButton
                  label={opt.label}
                  selected={answer === opt.value}
                  onPress={() => onAnswer(opt.value)}
                  small
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.optionList}>
            {question.options.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={answer === opt.value}
                onPress={() => onAnswer(opt.value)}
              />
            ))}
          </View>
        )}

        <Spacer space={Styling.Spacing.lrg} />

        <TouchableOpacity
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
          onPress={onNext}
          disabled={!canContinue}
          activeOpacity={0.7}
        >
          <StyledText type="head4" style={{ color: canContinue ? Styling.Colors.white : Styling.Colors.lightGrey }}>
            {isLast ? "Bekijk resultaten" : "Volgende"}
          </StyledText>
        </TouchableOpacity>
      </View>
    </StyledView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Styling.Spacing.sml,
  },
  headerTitle: {
    color: Styling.Colors.white,
    textAlign: "center",
    flexShrink: 1,
    paddingLeft: 50,
    paddingRight: 50,
  },
  headerBack: {
    position: "absolute",
    left: 0,
    zIndex: 1,
  },
  contentPad: {
    paddingHorizontal: Styling.Padding.reg,
    alignItems: "center",
    width: "100%",
  },
  optionList: {
    width: "100%",
    gap: Styling.Spacing.sml,
  },
  monthGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Styling.Spacing.sml,
    justifyContent: "center",
  },
  monthCell: {
    width: "30%",
  },
  explanation: {
    color: Styling.Colors.white,
    lineHeight: 22,
    textAlign: "center",
  },
  nextBtn: {
    alignSelf: "center",
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

export default QuestionScreen;
