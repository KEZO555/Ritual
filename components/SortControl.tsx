import { SORT_OPTIONS, type SortKey } from "@/data/recipes";
import { n } from "@/utils/scaling";
import { HapticPressable } from "./HapticPressable";
import { StyledText } from "./StyledText";

interface SortControlProps {
  onChange: (key: SortKey) => void;
  value: SortKey;
}

// Tap to cycle through the sort options.
export function SortControl({ value, onChange }: SortControlProps) {
  const index = SORT_OPTIONS.findIndex((option) => option.key === value);
  const current = SORT_OPTIONS[index] ?? SORT_OPTIONS[0];
  const next = SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length];

  return (
    <HapticPressable
      accessibilityHint="Cycles the recipe sort order"
      accessibilityLabel={`Sort: ${current.label}`}
      accessibilityRole="button"
      onPress={() => onChange(next.key)}
    >
      <StyledText style={{ fontSize: n(16), opacity: 0.6 }}>
        {`Sort: ${current.label}`}
      </StyledText>
    </HapticPressable>
  );
}
