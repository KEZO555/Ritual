import { StyleSheet, View } from "react-native";
import { StyledText } from "@/components/StyledText";
import { formatDuration, type Step } from "@/data/recipes";
import { n } from "@/utils/scaling";

interface BrewStepsProps {
  activeIndex: number;
  onStepRef: (index: number, node: View | null) => void;
  steps: Step[];
}

export function BrewSteps({ steps, activeIndex, onStepRef }: BrewStepsProps) {
  return (
    <View style={styles.steps}>
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={step.instruction}
            ref={(node) => onStepRef(index, node)}
            style={styles.step}
          >
            <StyledText style={styles.stepTime}>
              {step.at === undefined ? "Prep" : formatDuration(step.at)}
            </StyledText>
            <StyledText
              style={[styles.stepText, isActive && styles.stepTextActive]}
            >
              {step.instruction}
            </StyledText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  steps: {
    width: "100%",
    gap: n(20),
    paddingLeft: n(37),
    paddingRight: n(46),
  },
  step: {
    width: "100%",
    gap: n(4),
  },
  stepTime: {
    fontSize: n(16),
  },
  stepText: {
    fontSize: n(22),
    lineHeight: n(30),
    opacity: 0.55,
  },
  stepTextActive: {
    opacity: 1,
  },
});
