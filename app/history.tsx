import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { useBrewHistory } from "@/contexts/BrewHistoryContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import { getRecipe, recipeMetaLabel } from "@/data/recipes";
import { n } from "@/utils/scaling";

type Tab = "recent" | "log";

function stars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

function RecentTab() {
  const { recent } = useRecentlyViewed();
  const { getUserRecipe } = useUserRecipes();

  if (recent.length === 0) {
    return (
      <StyledText style={styles.empty}>
        No recipes viewed yet. Open any recipe and it will appear here.
      </StyledText>
    );
  }

  return (
    <>
      {recent.map((id) => {
        const recipe = getRecipe(id) ?? getUserRecipe(id);
        if (!recipe) {
          return null;
        }
        return (
          <StyledButton
            key={id}
            onPress={() => router.push({ pathname: "/recipe", params: { id } })}
            subtitle={recipeMetaLabel(recipe)}
            text={recipe.name}
          />
        );
      })}
    </>
  );
}

function BrewLogTab({ filterRecipeId }: { filterRecipeId?: string }) {
  const { entries, removeEntry } = useBrewHistory();
  const { getUserRecipe } = useUserRecipes();

  const filtered = filterRecipeId
    ? entries.filter((e) => e.recipeId === filterRecipeId)
    : entries;

  const confirmDelete = (id: string) => {
    Alert.alert("Delete brew log entry?", "This cannot be undone.", [
      { style: "cancel", text: "Cancel" },
      {
        style: "destructive",
        text: "Delete",
        onPress: () => removeEntry(id),
      },
    ]);
  };

  if (filtered.length === 0) {
    return (
      <StyledText style={styles.empty}>
        {filterRecipeId
          ? "No logged brews for this recipe yet."
          : 'No brews logged yet. Open a recipe and tap "Log this brew" after you pour.'}
      </StyledText>
    );
  }

  return (
    <>
      {filterRecipeId ? (
        <HapticPressable
          onPress={() => router.setParams({ recipeId: undefined })}
        >
          <StyledText style={styles.filterChip}>
            Filtered by recipe · Show all
          </StyledText>
        </HapticPressable>
      ) : null}
      {filtered.map((entry) => {
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
            onLongPress={() => confirmDelete(entry.id)}
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
      })}
    </>
  );
}

export default function HistoryScreen() {
  const { tab: tabParam, recipeId: filterRecipeId } = useLocalSearchParams<{
    tab?: string;
    recipeId?: string;
  }>();
  const [tab, setTab] = useState<Tab>(tabParam === "log" ? "log" : "recent");

  return (
    <ContentContainer headerTitle="History">
      <View style={styles.tabs}>
        {(["recent", "log"] as Tab[]).map((t) => (
          <HapticPressable key={t} onPress={() => setTab(t)}>
            <StyledText
              style={[styles.tab, tab === t ? styles.active : styles.idle]}
            >
              {t === "recent" ? "Recently viewed" : "Brew log"}
            </StyledText>
          </HapticPressable>
        ))}
      </View>

      {tab === "recent" ? (
        <RecentTab />
      ) : (
        <BrewLogTab filterRecipeId={filterRecipeId} />
      )}
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: n(26),
    paddingTop: n(9),
    paddingBottom: n(16),
  },
  tab: {
    fontSize: n(24),
  },
  active: {
    opacity: 1,
    textDecorationLine: "underline",
  },
  idle: {
    opacity: 0.4,
  },
  empty: {
    fontSize: n(20),
    lineHeight: n(28),
    opacity: 0.6,
  },
  filterChip: {
    fontSize: n(16),
    opacity: 0.5,
    textDecorationLine: "underline",
    paddingBottom: n(8),
  },
});
