import { router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledButton } from "@/components/StyledButton";
import { TextInput } from "@/components/TextInput";
import { useFilters } from "@/contexts/FiltersContext";
import {
  BREW_TIME_LABELS,
  GRIND_LABELS,
  METHOD_LABELS,
  ORIENTATION_LABELS,
  ROAST_LABELS,
} from "@/data/recipes";

const ANY = "Any";

export default function SearchScreen() {
  const { filters, setFilter, resetFilters } = useFilters();

  const hasFilters =
    filters.roast !== null ||
    filters.grind !== null ||
    filters.method !== null ||
    filters.orientation !== null ||
    filters.brewTime !== null ||
    filters.query.trim() !== "";

  return (
    <ContentContainer
      headerTitle="Search"
      hideBackButton
      rightAction={{
        accessibilityLabel: "Show results",
        icon: "search",
        onPress: () => router.push("/search-results"),
      }}
    >
      <TextInput
        onChangeText={(text) => setFilter("query", text)}
        onSubmit={() => router.push("/search-results")}
        placeholder="Search by name"
        value={filters.query}
      />
      <SelectorButton
        href="/filters/method"
        label="Method"
        value={filters.method ? METHOD_LABELS[filters.method] : ANY}
      />
      <SelectorButton
        href="/filters/roast"
        label="Roast"
        value={filters.roast ? ROAST_LABELS[filters.roast] : ANY}
      />
      <SelectorButton
        href="/filters/grind"
        label="Grind"
        value={filters.grind ? GRIND_LABELS[filters.grind] : ANY}
      />
      <SelectorButton
        href="/filters/orientation"
        label="Orientation"
        value={
          filters.orientation ? ORIENTATION_LABELS[filters.orientation] : ANY
        }
      />
      <SelectorButton
        href="/filters/brew-time"
        label="Brew Time"
        value={filters.brewTime ? BREW_TIME_LABELS[filters.brewTime] : ANY}
      />
      {hasFilters && <StyledButton onPress={resetFilters} text="Reset" />}
    </ContentContainer>
  );
}
