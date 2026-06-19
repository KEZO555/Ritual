import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Onboarding } from "@/components/Onboarding";
import { BrewHistoryProvider } from "@/contexts/BrewHistoryContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { FiltersProvider } from "@/contexts/FiltersContext";
import {
  InvertColorsProvider,
  useInvertColors,
} from "@/contexts/InvertColorsContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { UserRecipesProvider } from "@/contexts/UserRecipesContext";

const ONBOARDED_KEY = "onboarded";

function RootLayout() {
  const { invertColors } = useInvertColors();
  // Assume onboarded until storage says otherwise, so returning users never
  // flash the onboarding screen.
  const [status, setStatus] = useState<"loading" | "onboarding" | "ready">(
    "loading"
  );

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then((value) =>
      setStatus(value === "true" ? "ready" : "onboarding")
    );
  }, []);

  if (status === "loading") {
    return null;
  }

  if (status === "onboarding") {
    return (
      <Onboarding
        onDone={() => {
          AsyncStorage.setItem(ONBOARDED_KEY, "true");
          setStatus("ready");
        }}
      />
    );
  }

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
        <SettingsProvider>
          <FavoritesProvider>
            <UserRecipesProvider>
              <RecentlyViewedProvider>
                <BrewHistoryProvider>
                  <FiltersProvider>
                    <StatusBar hidden />
                    <RootLayout />
                  </FiltersProvider>
                </BrewHistoryProvider>
              </RecentlyViewedProvider>
            </UserRecipesProvider>
          </FavoritesProvider>
        </SettingsProvider>
      </InvertColorsProvider>
    </GestureHandlerRootView>
  );
}
