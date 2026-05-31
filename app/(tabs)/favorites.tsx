import { router } from "expo-router";
import { StyleSheet } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import { getRecipe, recipeTypeLabel } from "@/data/recipes";
import { n } from "@/utils/scaling";

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { getUserRecipe } = useUserRecipes();

  const saved = favorites
    .map((id) => getRecipe(id) ?? getUserRecipe(id))
    .filter((recipe) => recipe !== undefined);

  return (
    <ContentContainer headerTitle="Favorites" hideBackButton>
      {saved.length === 0 ? (
        <StyledText style={styles.empty}>
          No saved recipes yet. Tap the heart on any recipe to save it here.
        </StyledText>
      ) : (
        saved.map((recipe) => (
          <StyledButton
            key={recipe.id}
            numberOfLines={2}
            onPress={() =>
              router.push({ pathname: "/recipe", params: { id: recipe.id } })
            }
            subtitle={recipeTypeLabel(recipe)}
            text={recipe.name}
          />
        ))
      )}
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: n(20),
    opacity: 0.6,
    lineHeight: n(28),
  },
});
