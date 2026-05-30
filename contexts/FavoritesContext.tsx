import { createContext, type ReactNode, useCallback, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {
    throw new Error("useFavorites must be used within FavoritesProvider");
  },
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = usePersistedState<string[]>(
    "favorites",
    []
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites(
        favorites.includes(id)
          ? favorites.filter((favorite) => favorite !== id)
          : [...favorites, id]
      );
    },
    [favorites, setFavorites]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
