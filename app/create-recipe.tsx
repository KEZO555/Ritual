import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { TextInput } from "@/components/TextInput";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import {
  type BrewMethod,
  GRIND_LABELS,
  type Grind,
  METHOD_LABELS,
  ORIENTATION_LABELS,
  type Orientation,
  type Recipe,
  ROAST_LABELS,
  type Roast,
  type Step,
} from "@/data/recipes";
import { n } from "@/utils/scaling";

const METHODS: BrewMethod[] = ["aeropress", "v60"];
const ROASTS: Roast[] = ["light", "medium", "dark"];
const GRINDS: Grind[] = ["fine", "medium", "coarse"];
const ORIENTATIONS: Orientation[] = ["standard", "inverted"];

interface StepDraft {
  at: string;
  id: string;
  instruction: string;
}

let stepCounter = 0;
function newStep(): StepDraft {
  stepCounter += 1;
  return { at: "", id: `step-${stepCounter}`, instruction: "" };
}

function parseSeconds(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return;
  }
  if (trimmed.includes(":")) {
    const [mins, secs] = trimmed.split(":");
    const total = Number(mins) * 60 + Number(secs);
    return Number.isFinite(total) ? total : undefined;
  }
  const seconds = Number(trimmed);
  return Number.isFinite(seconds) ? seconds : undefined;
}

function Cycler<T extends string>({
  label,
  value,
  labels,
  onPress,
}: {
  label: string;
  value: T;
  labels: Record<T, string>;
  onPress: () => void;
}) {
  return (
    <HapticPressable onPress={onPress} style={styles.cycler}>
      <StyledText style={styles.cyclerLabel}>{label}</StyledText>
      <StyledText style={styles.cyclerValue}>{labels[value]}</StyledText>
    </HapticPressable>
  );
}

export default function CreateRecipeScreen() {
  const { addRecipe } = useUserRecipes();

  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [blurb, setBlurb] = useState("");
  const [coffee, setCoffee] = useState("");
  const [water, setWater] = useState("");
  const [temp, setTemp] = useState("");
  const [clicks, setClicks] = useState("");
  const [methodIndex, setMethodIndex] = useState(0);
  const [roastIndex, setRoastIndex] = useState(0);
  const [grindIndex, setGrindIndex] = useState(1);
  const [orientationIndex, setOrientationIndex] = useState(0);
  const [steps, setSteps] = useState<StepDraft[]>([newStep()]);

  const updateStep = (index: number, patch: Partial<StepDraft>) => {
    setSteps((current) =>
      current.map((step, i) => (i === index ? { ...step, ...patch } : step))
    );
  };

  const addStep = () => {
    setSteps((current) => [...current, newStep()]);
  };

  const removeStep = (id: string) => {
    setSteps((current) => current.filter((step) => step.id !== id));
  };

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    const parsedSteps: Step[] = steps
      .filter((step) => step.instruction.trim().length > 0)
      .map((step) => {
        const at = parseSeconds(step.at);
        return at === undefined
          ? { instruction: step.instruction.trim() }
          : { at, instruction: step.instruction.trim() };
      });

    const timedSteps = parsedSteps.filter((step) => step.at !== undefined);
    const totalSeconds = timedSteps.reduce(
      (max, step) => Math.max(max, step.at ?? 0),
      0
    );

    const method = METHODS[methodIndex];
    const recipe: Recipe = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      author: author.trim() || "You",
      blurb: blurb.trim(),
      method,
      roast: ROASTS[roastIndex],
      grind: GRINDS[grindIndex],
      coffeeGrams: Number(coffee) || 0,
      waterGrams: Number(water) || 0,
      waterTempC: Number(temp) || 0,
      c40Clicks: Number(clicks) || 0,
      totalSeconds,
      steps: parsedSteps,
      ...(method === "aeropress"
        ? { orientation: ORIENTATIONS[orientationIndex] }
        : {}),
    };

    addRecipe(recipe);
    router.replace({ pathname: "/recipe", params: { id: recipe.id } });
  };

  return (
    <ContentContainer
      contentGap={24}
      headerTitle="New recipe"
      rightAction={{ icon: "check", onPress: handleSave, show: canSave }}
    >
      <TextInput
        autoCapitalize="words"
        onChangeText={setName}
        placeholder="Name"
        returnKeyType="next"
        value={name}
      />
      <TextInput
        autoCapitalize="words"
        onChangeText={setAuthor}
        placeholder="Author"
        returnKeyType="next"
        value={author}
      />
      <TextInput
        autoCapitalize="sentences"
        onChangeText={setBlurb}
        placeholder="Short description"
        returnKeyType="next"
        value={blurb}
      />
      <TextInput
        keyboardType="numeric"
        onChangeText={setCoffee}
        placeholder="Coffee (g)"
        value={coffee}
      />
      <TextInput
        keyboardType="numeric"
        onChangeText={setWater}
        placeholder="Water (g)"
        value={water}
      />
      <TextInput
        keyboardType="numeric"
        onChangeText={setTemp}
        placeholder="Water temp (C)"
        value={temp}
      />
      <TextInput
        keyboardType="numeric"
        onChangeText={setClicks}
        placeholder="C40 clicks"
        value={clicks}
      />
      <Cycler
        label="Method"
        labels={METHOD_LABELS}
        onPress={() => setMethodIndex((i) => (i + 1) % METHODS.length)}
        value={METHODS[methodIndex]}
      />
      <Cycler
        label="Roast"
        labels={ROAST_LABELS}
        onPress={() => setRoastIndex((i) => (i + 1) % ROASTS.length)}
        value={ROASTS[roastIndex]}
      />
      <Cycler
        label="Grind"
        labels={GRIND_LABELS}
        onPress={() => setGrindIndex((i) => (i + 1) % GRINDS.length)}
        value={GRINDS[grindIndex]}
      />
      {METHODS[methodIndex] === "aeropress" ? (
        <Cycler
          label="Orientation"
          labels={ORIENTATION_LABELS}
          onPress={() =>
            setOrientationIndex((i) => (i + 1) % ORIENTATIONS.length)
          }
          value={ORIENTATIONS[orientationIndex]}
        />
      ) : null}

      <StyledText style={styles.sectionTitle}>Steps</StyledText>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.step}>
          <View style={styles.stepHeader}>
            <StyledText style={styles.stepNumber}>{index + 1}</StyledText>
            {steps.length > 1 && (
              <HapticPressable onPress={() => removeStep(step.id)}>
                <StyledText style={styles.stepRemove}>Remove</StyledText>
              </HapticPressable>
            )}
          </View>
          <TextInput
            keyboardType="numbers-and-punctuation"
            onChangeText={(text) => updateStep(index, { at: text })}
            placeholder="Time (m:ss, blank for prep)"
            value={step.at}
          />
          <TextInput
            autoCapitalize="sentences"
            onChangeText={(text) => updateStep(index, { instruction: text })}
            placeholder="Instruction"
            returnKeyType="next"
            value={step.instruction}
          />
        </View>
      ))}
      <HapticPressable onPress={addStep}>
        <StyledText style={styles.addStep}>+ Add step</StyledText>
      </HapticPressable>
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  cycler: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: n(12),
  },
  cyclerLabel: {
    fontSize: n(20),
    opacity: 0.6,
  },
  cyclerValue: {
    fontSize: n(24),
  },
  sectionTitle: {
    fontSize: n(30),
  },
  step: {
    width: "100%",
    gap: n(12),
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  stepNumber: {
    fontSize: n(20),
    opacity: 0.6,
  },
  stepRemove: {
    fontSize: n(18),
    opacity: 0.6,
  },
  addStep: {
    fontSize: n(22),
  },
});
