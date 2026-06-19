import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { SortControl } from "@/components/SortControl";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import {
  categoryRecipes,
  getCategory,
  recipeMetaLabel,
  type SortKey,
  sortRecipes,
} from "@/data/recipes";
import { n } from "@/utils/scaling";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recent } = useRecentlyViewed();
  const [sort, setSort] = useState<SortKey>("default");
  const category = id ? getCategory(id) : undefined;

  if (!category) {
    return (
      <ContentContainer headerTitle="Recipes">
        <StyledText style={styles.message}>Category not found.</StyledText>
      </ContentContainer>
    );
  }

  const results = sortRecipes(categoryRecipes(category), sort, recent);

  return (
    <ContentContainer headerTitle={category.name}>
      <View style={styles.header}>
        <StyledText style={styles.blurb}>{category.blurb}</StyledText>
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
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: n(12),
  },
  blurb: {
    flex: 1,
    fontSize: n(18),
    opacity: 0.6,
  },
  message: {
    fontSize: n(24),
  },
});
