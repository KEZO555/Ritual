import { ScrollView, StyleSheet, View } from "react-native";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { type BrewMethod, GRINDERS, type TempUnit } from "@/data/recipes";
import { n } from "@/utils/scaling";
import { SegmentedField } from "./SegmentedField";
import { StyledButton } from "./StyledButton";
import { StyledText } from "./StyledText";

// Shown once on first launch to capture a few brewing preferences. Rendered
// outside the router, so it uses plain primitives (no Header/ContentContainer).
export function Onboarding({ onDone }: { onDone: () => void }) {
  const { invertColors } = useInvertColors();
  const {
    tempUnit,
    setTempUnit,
    defaultMethod,
    setDefaultMethod,
    defaultGrinder,
    setDefaultGrinder,
  } = useSettings();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: invertColors ? "white" : "black" },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StyledText style={styles.title}>Ritual</StyledText>
        <StyledText style={styles.subtitle}>
          A few quick preferences — you can change any of these later in
          Settings.
        </StyledText>
        <SegmentedField
          label="Default method"
          onChange={(value) => setDefaultMethod(value as BrewMethod)}
          options={[
            { label: "AeroPress", value: "aeropress" },
            { label: "V60", value: "v60" },
          ]}
          value={defaultMethod}
        />
        <SegmentedField
          label="Temperature"
          onChange={(value) => setTempUnit(value as TempUnit)}
          options={[
            { label: "Celsius", value: "C" },
            { label: "Fahrenheit", value: "F" },
          ]}
          value={tempUnit}
        />
        <View style={styles.section}>
          <StyledText style={styles.heading}>Grinder</StyledText>
          {GRINDERS.map((grinder) => (
            <StyledButton
              key={grinder.id}
              onPress={() => setDefaultGrinder(grinder.id)}
              selected={grinder.id === defaultGrinder}
              text={grinder.name}
            />
          ))}
        </View>
        <StyledButton onPress={onDone} text="Start brewing" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  content: {
    gap: n(28),
    paddingTop: n(70),
    paddingBottom: n(50),
    paddingLeft: n(37),
    paddingRight: n(46),
  },
  title: {
    fontSize: n(44),
  },
  subtitle: {
    fontSize: n(18),
    lineHeight: n(26),
    opacity: 0.6,
  },
  section: {
    width: "100%",
    gap: n(18),
  },
  heading: {
    fontSize: n(18),
    opacity: 0.5,
  },
});
