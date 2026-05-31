import { router } from "expo-router";
import { OptionsSelector } from "@/components/OptionsSelector";
import { useFilters } from "@/contexts/FiltersContext";
import { type BrewMethod, METHOD_LABELS } from "@/data/recipes";

const OPTIONS = [
  { label: "Any", value: "any" },
  ...(Object.keys(METHOD_LABELS) as BrewMethod[]).map((value) => ({
    label: METHOD_LABELS[value],
    value,
  })),
];

export default function MethodFilterScreen() {
  const { filters, setFilter } = useFilters();

  return (
    <OptionsSelector
      onSelect={(value) => {
        setFilter("method", value === "any" ? null : (value as BrewMethod));
        router.back();
      }}
      options={OPTIONS}
      selectedValue={filters.method ?? "any"}
      title="Method"
    />
  );
}
