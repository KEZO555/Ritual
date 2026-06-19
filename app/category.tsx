import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { categoryRecipes, getCategory, recipeMetaLabel } from "@/data/recipes";
import { n } from "@/utils/scaling";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = id ? getCategory(id) : undefined;

  if (!category) {
    return (
      <ContentContainer headerTitle="Recipes">
        <StyledText style={styles.message}>Category not found.</StyledText>
      </ContentContainer>
    );
  }

  const results = categoryRecipes(category);

  return (
    <ContentContainer headerTitle={category.name}>
      <StyledText style={styles.blurb}>{category.blurb}</StyledText>
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
  blurb: {
    fontSize: n(18),
    opacity: 0.6,
  },
  message: {
    fontSize: n(24),
  },
});
