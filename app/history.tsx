import { router } from "expo-router";
import { StyleSheet } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { useBrewHistory } from "@/contexts/BrewHistoryContext";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import { getRecipe } from "@/data/recipes";
import { n } from "@/utils/scaling";

function stars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

export default function HistoryScreen() {
  const { entries } = useBrewHistory();
  const { getUserRecipe } = useUserRecipes();

  return (
    <ContentContainer headerTitle="Brew History">
      {entries.length === 0 ? (
        <StyledText style={styles.empty}>
          No brews logged yet. Open a recipe and tap "Log this brew" after you
          pour.
        </StyledText>
      ) : (
        entries.map((entry) => {
          const recipe =
            getRecipe(entry.recipeId) ?? getUserRecipe(entry.recipeId);
          const date = new Date(entry.at).toLocaleDateString();
          const subtitle = entry.note
            ? `${stars(entry.rating)} · ${date} · ${entry.note}`
            : `${stars(entry.rating)} · ${date}`;
          return (
            <StyledButton
              key={entry.id}
              numberOfLines={2}
              onPress={() =>
                router.push({
                  pathname: "/recipe",
                  params: { id: entry.recipeId },
                })
              }
              subtitle={subtitle}
              text={recipe?.name ?? "Recipe"}
            />
          );
        })
      )}
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: n(20),
    lineHeight: n(28),
    opacity: 0.6,
  },
});
