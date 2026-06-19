import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { SegmentedField } from "@/components/SegmentedField";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { TextInput } from "@/components/TextInput";
import { useBrewHistory } from "@/contexts/BrewHistoryContext";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import { getRecipe } from "@/data/recipes";
import { n } from "@/utils/scaling";

const RATING_OPTIONS = ["1", "2", "3", "4", "5"].map((value) => ({
  label: value,
  value,
}));

export default function LogBrewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getUserRecipe } = useUserRecipes();
  const { addEntry } = useBrewHistory();
  const recipe = id ? (getRecipe(id) ?? getUserRecipe(id)) : undefined;
  const [rating, setRating] = useState("4");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!id) {
      return;
    }
    addEntry({
      recipeId: id,
      rating: Number(rating),
      note: note.trim() || undefined,
    });
    router.back();
  };

  return (
    <ContentContainer headerTitle="Log Brew">
      {recipe ? (
        <StyledText style={styles.name}>{recipe.name}</StyledText>
      ) : null}
      <SegmentedField
        label="Rating"
        onChange={setRating}
        options={RATING_OPTIONS}
        value={rating}
      />
      <TextInput
        autoCapitalize="sentences"
        onChangeText={setNote}
        placeholder="Note (optional)"
        value={note}
      />
      <StyledButton onPress={handleSave} text="Save" />
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: n(20),
    opacity: 0.6,
  },
});
