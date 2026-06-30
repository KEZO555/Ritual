import { StyleSheet, View } from "react-native";
import { n } from "@/utils/scaling";
import { HapticPressable } from "./HapticPressable";
import { StyledText } from "./StyledText";

interface ButtonProps {
  numberOfLines?: number;
  onLongPress?: () => void;
  onPress?: () => void;
  selected?: boolean;
  subtitle?: string;
  text: string;
}

export function StyledButton({
  text,
  onPress,
  onLongPress,
  selected = false,
  numberOfLines = 1,
  subtitle,
}: ButtonProps) {
  return (
    <HapticPressable
      onLongPress={onLongPress}
      onPress={onPress}
      style={styles.button}
    >
      <View style={styles.labelGroup}>
        <StyledText
          numberOfLines={numberOfLines}
          style={[styles.buttonText, selected && styles.selected]}
        >
          {text}
        </StyledText>
        {subtitle ? (
          <StyledText style={styles.subtitle}>{subtitle}</StyledText>
        ) : null}
      </View>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  labelGroup: {
    flex: 1,
    gap: n(4),
  },
  buttonText: {
    fontSize: n(30),
  },
  subtitle: {
    fontSize: n(15),
    opacity: 0.5,
  },
  selected: {
    textDecorationLine: "underline",
  },
});
