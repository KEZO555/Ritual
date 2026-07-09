import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import {
  BROWSE_METHODS,
  type BrewMethod,
  categoriesForMethod,
  getRecipe,
  METHOD_LABELS,
  recipeMetaLabel,
  recipes,
} from "@/data/recipes";
import { n } from "@/utils/scaling";

// Methods with small catalogues list their recipes directly, no categories.
const DIRECT_LIST_METHODS: BrewMethod[] = ["orea-o1", "orea-z1"];

export default function RecipesScreen() {
  const { userRecipes, getUserRecipe } = useUserRecipes();
  const { defaultMethod } = useSettings();
  const { invertColors } = useInvertColors();
  const { recent } = useRecentlyViewed();
  const [method, setMethod] = useState<BrewMethod>(defaultMethod);
  const [methodOpen, setMethodOpen] = useState(false);

  // Adopt the saved default tab once the persisted setting has hydrated.
  useEffect(() => {
    setMethod(defaultMethod);
  }, [defaultMethod]);

  const recipesForMethod = userRecipes.filter(
    (recipe) => recipe.method === method
  );
  const directList = DIRECT_LIST_METHODS.includes(method);
  const categories = directList ? [] : categoriesForMethod(method);
  const directRecipes = directList
    ? recipes.filter((recipe) => recipe.method === method)
    : [];
  const recentRecipes = recent
    .map((recipeId) => getRecipe(recipeId) ?? getUserRecipe(recipeId))
    .filter((recipe) => recipe !== undefined)
    .slice(0, 4);

  return (
    <ContentContainer
      headerTitle="Recipes"
      hideBackButton
      rightAction={{
        accessibilityLabel: "Create recipe",
        icon: "add",
        onPress: () => router.push("/create-recipe"),
      }}
    >
      <View style={styles.methodSelect}>
        <HapticPressable
          accessibilityLabel="Choose brew method"
          accessibilityRole="button"
          onPress={() => setMethodOpen((open) => !open)}
          style={styles.methodButton}
        >
          <StyledText style={styles.methodCurrent}>
            {METHOD_LABELS[method]}
          </StyledText>
          <MaterialIcons
            color={invertColors ? "black" : "white"}
            name="arrow-forward-ios"
            size={n(18)}
            style={methodOpen ? styles.chevronUp : styles.chevronDown}
          />
        </HapticPressable>
        {methodOpen
          ? BROWSE_METHODS.filter((m) => m !== method).map((m) => (
              <HapticPressable
                key={m}
                onPress={() => {
                  setMethod(m);
                  setMethodOpen(false);
                }}
              >
                <StyledText style={styles.methodOption}>
                  {METHOD_LABELS[m]}
                </StyledText>
              </HapticPressable>
            ))
          : null}
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
      {directRecipes.map((recipe) => (
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
  methodSelect: {
    width: "100%",
    gap: n(16),
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: n(12),
  },
  methodCurrent: {
    fontSize: n(22),
    textDecorationLine: "underline",
  },
  chevronDown: {
    transform: [{ rotate: "90deg" }],
  },
  chevronUp: {
    transform: [{ rotate: "-90deg" }],
  },
  methodOption: {
    fontSize: n(22),
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
