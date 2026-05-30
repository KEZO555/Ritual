import { router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { StyledButton } from "@/components/StyledButton";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import { categories } from "@/data/recipes";

export default function RecipesScreen() {
  const { userRecipes } = useUserRecipes();

  return (
    <ContentContainer
      headerTitle="Recipes"
      hideBackButton
      rightAction={{
        icon: "add",
        onPress: () => router.push("/create-recipe"),
      }}
    >
      {userRecipes.map((recipe) => (
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
    </ContentContainer>
  );
}
