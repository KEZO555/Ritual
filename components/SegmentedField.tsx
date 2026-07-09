import { StyleSheet, View } from "react-native";
import { n } from "@/utils/scaling";
import { HapticPressable } from "./HapticPressable";
import { StyledText } from "./StyledText";

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedFieldProps {
  label: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  value: string;
}

// A labelled row of mutually-exclusive choices; the selected option is
// underlined, matching the recipe screen's roast/tab selectors.
export function SegmentedField({
  label,
  options,
  value,
  onChange,
}: SegmentedFieldProps) {
  return (
    <View style={styles.container}>
      <StyledText style={styles.label}>{label}</StyledText>
      <View style={styles.options}>
        {options.map((option) => (
          <HapticPressable
            key={option.value}
            onPress={() => onChange(option.value)}
          >
            <StyledText
              style={[
                styles.option,
                value === option.value ? styles.active : styles.idle,
              ]}
            >
              {option.label}
            </StyledText>
          </HapticPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: n(14),
    paddingTop: n(9),
  },
  label: {
    fontSize: n(30),
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: n(26),
    rowGap: n(12),
  },
  option: {
    fontSize: n(24),
  },
  active: {
    opacity: 1,
    textDecorationLine: "underline",
  },
  idle: {
    opacity: 0.4,
  },
});
