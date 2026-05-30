import { createContext, type ReactNode, useCallback, useContext } from "react";
import type { Recipe } from "@/data/recipes";
import { usePersistedState } from "@/hooks/usePersistedState";

interface UserRecipesContextType {
  addRecipe: (recipe: Recipe) => void;
  getUserRecipe: (id: string) => Recipe | undefined;
  removeRecipe: (id: string) => void;
  userRecipes: Recipe[];
}

const UserRecipesContext = createContext<UserRecipesContextType>({
  addRecipe: () => {
    throw new Error("useUserRecipes must be used within UserRecipesProvider");
  },
  getUserRecipe: () => undefined,
  removeRecipe: () => undefined,
  userRecipes: [],
});

export const useUserRecipes = () => useContext(UserRecipesContext);

export const UserRecipesProvider = ({ children }: { children: ReactNode }) => {
  const [userRecipes, setUserRecipes] = usePersistedState<Recipe[]>(
    "userRecipes",
    []
  );

  const addRecipe = useCallback(
    (recipe: Recipe) => {
      setUserRecipes([recipe, ...userRecipes]);
    },
    [userRecipes, setUserRecipes]
  );

  const removeRecipe = useCallback(
    (id: string) => {
      setUserRecipes(userRecipes.filter((recipe) => recipe.id !== id));
    },
    [userRecipes, setUserRecipes]
  );

  const getUserRecipe = useCallback(
    (id: string) => userRecipes.find((recipe) => recipe.id === id),
    [userRecipes]
  );

  return (
    <UserRecipesContext.Provider
      value={{ addRecipe, getUserRecipe, removeRecipe, userRecipes }}
    >
      {children}
    </UserRecipesContext.Provider>
  );
};
