import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import {
  BROWSE_METHODS,
  type BrewMethod,
  categoriesForMethod,
  getRecipe,
  METHOD_LABELS,
} from "@/data/recipes";
import { n } from "@/utils/scaling";

export default function RecipesScreen() {
  const { userRecipes, getUserRecipe } = useUserRecipes();
  const { defaultMethod } = useSettings();
  const { recent } = useRecentlyViewed();
  const [method, setMethod] = useState<BrewMethod>(defaultMethod);

  // Adopt the saved default tab once the persisted setting has hydrated.
  useEffect(() => {
    setMethod(defaultMethod);
  }, [defaultMethod]);

  const recipesForMethod = userRecipes.filter(
    (recipe) => recipe.method === method
  );
  const categories = categoriesForMethod(method);
  const recentRecipes = recent
    .map((recipeId) => getRecipe(recipeId) ?? getUserRecipe(recipeId))
    .filter((recipe) => recipe !== undefined)
    .slice(0, 4);

  return (
    <ContentContainer
      headerTitle="Recipes"
      hideBackButton
      rightAction={{
        icon: "add",
        onPress: () => router.push("/create-recipe"),
      }}
    >
      <View style={styles.tabs}>
        {BROWSE_METHODS.map((m) => (
          <HapticPressable key={m} onPress={() => setMethod(m)}>
            <StyledText
              style={[
                styles.tab,
                method === m ? styles.tabActive : styles.tabIdle,
              ]}
            >
              {METHOD_LABELS[m]}
            </StyledText>
          </HapticPressable>
        ))}
      </View>
      {recipesForMethod.map((recipe) => (
        <StyledButton
          key={recipe.id}
          numberOfLines={2}
          onPress={() =>
            router.push({ pathname: "/recipe", params: { id: recipe.id } })
          }
          text={recipe.name}
        />
      ))}
      {categories.map((category) => (
        <StyledButton
          key={category.id}
          numberOfLines={2}
          onPress={() =>
            router.push({ pathname: "/category", params: { id: category.id } })
          }
          text={category.name}
        />
      ))}
      {recentRecipes.length > 0 ? (
        <View style={styles.recentSection}>
          <StyledText style={styles.recentHeading}>Recently viewed</StyledText>
          {recentRecipes.map((recipe) => (
            <StyledButton
              key={recipe.id}
              numberOfLines={1}
              onPress={() =>
                router.push({ pathname: "/recipe", params: { id: recipe.id } })
              }
              text={recipe.name}
            />
          ))}
        </View>
      ) : null}
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: n(28),
  },
  tab: {
    fontSize: n(22),
  },
  tabActive: {
    opacity: 1,
    textDecorationLine: "underline",
  },
  tabIdle: {
    opacity: 0.4,
  },
  recentSection: {
    width: "100%",
    gap: n(18),
  },
  recentHeading: {
    fontSize: n(18),
    opacity: 0.5,
  },
});
