import { StyleSheet, View } from "react-native";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { formatDuration } from "@/data/recipes";
import { n } from "@/utils/scaling";

interface BrewTimerProps {
  elapsed: number;
  onMeasureHeight?: (height: number) => void;
  onReset: () => void;
  onToggle: () => void;
  running: boolean;
}

export function BrewTimer({
  elapsed,
  running,
  onToggle,
  onReset,
  onMeasureHeight,
}: BrewTimerProps) {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const fg = invertColors ? "black" : "white";

  return (
    <View
      onLayout={(event) => onMeasureHeight?.(event.nativeEvent.layout.height)}
      style={[styles.container, { backgroundColor: bg, borderColor: fg }]}
    >
      <StyledText style={styles.time}>{formatDuration(elapsed)}</StyledText>
      <View style={styles.controls}>
        <HapticPressable onPress={onToggle}>
          <StyledText style={styles.control}>
            {running ? "Pause" : "Start"}
          </StyledText>
        </HapticPressable>
        <HapticPressable onPress={onReset}>
          <StyledText style={styles.control}>Reset</StyledText>
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: n(8),
    paddingBottom: n(12),
    paddingLeft: n(37),
    paddingRight: n(46),
    borderBottomWidth: n(1),
  },
  time: {
    fontSize: n(40),
  },
  controls: {
    flexDirection: "row",
    gap: n(20),
  },
  control: {
    fontSize: n(22),
  },
});
