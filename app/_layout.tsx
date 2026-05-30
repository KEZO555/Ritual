import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { FiltersProvider } from "@/contexts/FiltersContext";
import {
  InvertColorsProvider,
  useInvertColors,
} from "@/contexts/InvertColorsContext";
import { UserRecipesProvider } from "@/contexts/UserRecipesContext";

function RootLayout() {
  const { invertColors } = useInvertColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: {
          backgroundColor: invertColors ? "white" : "black",
        },
      }}
    />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <InvertColorsProvider>
        <FavoritesProvider>
          <UserRecipesProvider>
            <FiltersProvider>
              <StatusBar hidden />
              <RootLayout />
            </FiltersProvider>
          </UserRecipesProvider>
        </FavoritesProvider>
      </InvertColorsProvider>
    </GestureHandlerRootView>
  );
}
