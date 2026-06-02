import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { SegmentedField } from "@/components/SegmentedField";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { type BrewMethod, GRINDERS, type TempUnit } from "@/data/recipes";
import { n } from "@/utils/scaling";

export default function SettingsScreen() {
  const { invertColors, setInvertColors } = useInvertColors();
  const {
    hapticsEnabled,
    setHapticsEnabled,
    stepSound,
    setStepSound,
    keepAwake,
    setKeepAwake,
    tempUnit,
    setTempUnit,
    defaultMethod,
    setDefaultMethod,
    defaultGrinder,
    setDefaultGrinder,
  } = useSettings();

  return (
    <ContentContainer headerTitle="Settings" hideBackButton>
      <View style={styles.section}>
        <StyledText style={styles.heading}>Interface</StyledText>
        <ToggleSwitch
          label="Invert Colours"
          onValueChange={setInvertColors}
          value={invertColors}
        />
        <ToggleSwitch
          label="Haptic Feedback"
          onValueChange={setHapticsEnabled}
          value={hapticsEnabled}
        />
        <ToggleSwitch
          label="Step Sound"
          onValueChange={setStepSound}
          value={stepSound}
        />
        <ToggleSwitch
          label="Keep Screen Awake"
          onValueChange={setKeepAwake}
          value={keepAwake}
        />
      </View>

      <View style={styles.section}>
        <StyledText style={styles.heading}>Brewing</StyledText>
        <SegmentedField
          label="Temperature"
          onChange={(value) => setTempUnit(value as TempUnit)}
          options={[
            { label: "Celsius", value: "C" },
            { label: "Fahrenheit", value: "F" },
          ]}
          value={tempUnit}
        />
        <SegmentedField
          label="Default Method"
          onChange={(value) => setDefaultMethod(value as BrewMethod)}
          options={[
            { label: "AeroPress", value: "aeropress" },
            { label: "V60", value: "v60" },
          ]}
          value={defaultMethod}
        />
      </View>

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
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    gap: n(18),
  },
  heading: {
    fontSize: n(18),
    opacity: 0.5,
  },
});
