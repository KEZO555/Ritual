import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { SortControl } from "@/components/SortControl";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { useFilters } from "@/contexts/FiltersContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import {
  filterRecipes,
  recipeMetaLabel,
  type SortKey,
  sortRecipes,
} from "@/data/recipes";
import { n } from "@/utils/scaling";

export default function SearchResultsScreen() {
  const { filters } = useFilters();
  const { recent } = useRecentlyViewed();
  const [sort, setSort] = useState<SortKey>("default");
  const results = sortRecipes(filterRecipes(filters), sort, recent);

  return (
    <ContentContainer headerTitle="Results">
      {results.length === 0 ? (
        <StyledText style={{ fontSize: n(24) }}>No recipes match.</StyledText>
      ) : (
        <>
          <View style={{ alignItems: "flex-end", width: "100%" }}>
            <SortControl onChange={setSort} value={sort} />
          </View>
          {results.map((recipe) => (
            <StyledButton
              key={recipe.id}
              numberOfLines={2}
              onPress={() =>
                router.push({ pathname: "/recipe", params: { id: recipe.id } })
              }
              subtitle={recipeMetaLabel(recipe)}
              text={recipe.name}
            />
          ))}
        </>
      )}
    </ContentContainer>
  );
}
