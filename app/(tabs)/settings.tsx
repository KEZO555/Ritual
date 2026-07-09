import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Alert, Modal, Share, StyleSheet, TextInput, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { SegmentedField } from "@/components/SegmentedField";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { type BrewMethod, GRINDERS, type TempUnit } from "@/data/recipes";
import { n } from "@/utils/scaling";

const BACKUP_KEYS = [
  "brewHistory",
  "recentlyViewed",
  "favorites",
  "userRecipes",
];

async function exportBackup() {
  const pairs = await AsyncStorage.multiGet(BACKUP_KEYS);
  const data = Object.fromEntries(
    pairs
      .filter(([, v]) => v !== null)
      .map(([k, v]) => [k, JSON.parse(v as string)])
  );
  await Share.share({ message: JSON.stringify(data, null, 2) });
}

async function importBackup(json: string): Promise<void> {
  const data = JSON.parse(json);
  const pairs: [string, string][] = BACKUP_KEYS.filter(
    (k) => data[k] !== undefined
  ).map((k) => [k, JSON.stringify(data[k])]);
  if (pairs.length === 0) {
    throw new Error("No recognisable data found.");
  }
  await AsyncStorage.multiSet(pairs);
}

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
    grinderOffset,
    setGrinderOffset,
  } = useSettings();

  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const handleExport = async () => {
    try {
      await exportBackup();
    } catch {
      Alert.alert("Export failed", "Could not read data.");
    }
  };

  const handleImport = async () => {
    try {
      await importBackup(importText.trim());
      setShowImport(false);
      setImportText("");
      Alert.alert(
        "Backup restored",
        "Close and reopen the app to load your data."
      );
    } catch {
      Alert.alert(
        "Import failed",
        "Invalid backup format. Paste the full exported JSON."
      );
    }
  };

  let offsetLabel = `${grinderOffset} clicks`;
  if (grinderOffset === 0) {
    offsetLabel = "0 clicks";
  } else if (grinderOffset > 0) {
    offsetLabel = `+${grinderOffset} clicks`;
  }

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
            { label: "Orea O1", value: "orea-o1" },
            { label: "Orea Z1", value: "orea-z1" },
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
        <View style={styles.offsetRow}>
          <StyledText style={styles.offsetLabel}>Click offset</StyledText>
          <View style={styles.stepper}>
            <HapticPressable
              onPress={() => setGrinderOffset(grinderOffset - 1)}
              style={styles.stepButton}
            >
              <StyledText style={styles.stepSign}>−</StyledText>
            </HapticPressable>
            <StyledText style={styles.offsetValue}>{offsetLabel}</StyledText>
            <HapticPressable
              onPress={() => setGrinderOffset(grinderOffset + 1)}
              style={styles.stepButton}
            >
              <StyledText style={styles.stepSign}>+</StyledText>
            </HapticPressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <StyledText style={styles.heading}>Data</StyledText>
        <StyledButton onPress={handleExport} text="Export backup" />
        <StyledButton
          onPress={() => setShowImport(true)}
          text="Import backup"
        />
      </View>

      <Modal
        animationType="slide"
        onRequestClose={() => setShowImport(false)}
        transparent={false}
        visible={showImport}
      >
        <View style={styles.modal}>
          <StyledText style={styles.modalTitle}>Import backup</StyledText>
          <StyledText style={styles.modalHint}>
            Paste the exported JSON backup below.
          </StyledText>
          <TextInput
            multiline
            onChangeText={setImportText}
            placeholder="Paste JSON here…"
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.importInput}
            value={importText}
          />
          <View style={styles.modalActions}>
            <HapticPressable
              onPress={() => {
                setShowImport(false);
                setImportText("");
              }}
            >
              <StyledText style={styles.modalCancel}>Cancel</StyledText>
            </HapticPressable>
            <HapticPressable onPress={handleImport}>
              <StyledText style={styles.modalConfirm}>Restore</StyledText>
            </HapticPressable>
          </View>
        </View>
      </Modal>
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
  offsetRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  offsetLabel: {
    fontSize: n(20),
    opacity: 0.6,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: n(18),
  },
  stepButton: {
    minWidth: n(30),
    alignItems: "center",
  },
  stepSign: {
    fontSize: n(30),
  },
  offsetValue: {
    fontSize: n(20),
    minWidth: n(80),
    textAlign: "center",
  },
  modal: {
    flex: 1,
    backgroundColor: "black",
    padding: n(37),
    gap: n(24),
    paddingTop: n(80),
  },
  modalTitle: {
    fontSize: n(30),
  },
  modalHint: {
    fontSize: n(18),
    opacity: 0.6,
    lineHeight: n(26),
  },
  importInput: {
    flex: 1,
    color: "white",
    fontSize: n(14),
    fontFamily: "PublicSans-Regular",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: n(4),
    padding: n(12),
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: n(40),
  },
  modalCancel: {
    fontSize: n(24),
    opacity: 0.5,
  },
  modalConfirm: {
    fontSize: n(24),
    textDecorationLine: "underline",
  },
});
