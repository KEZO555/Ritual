import { type Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { BrewSteps } from "@/components/BrewSteps";
import { BrewTimer } from "@/components/BrewTimer";
import { BrewVisual } from "@/components/BrewVisual";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { type BrewEntry, useBrewHistory } from "@/contexts/BrewHistoryContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import {
  convertStepTemps,
  formatDuration,
  GRIND_LABELS,
  getGrinder,
  getRecipe,
  grinderClicks,
  METHOD_LABELS,
  ORIENTATION_LABELS,
  type Recipe,
  ROAST_LABELS,
  type Roast,
  type Step,
  scaleRecipe,
  type TempUnit,
  toDisplayTemp,
} from "@/data/recipes";
import { useBrewCues } from "@/hooks/useBrewCues";
import { useBrewTimer } from "@/hooks/useBrewTimer";
import { useScrollIndicator } from "@/hooks/useScrollIndicator";
import { n } from "@/utils/scaling";

function buildShareText(
  recipe: Recipe,
  ratio: number | null,
  tempUnit: TempUnit,
  steps: Step[]
): string {
  const ratioText = ratio === null ? "" : ` (1:${ratio})`;
  const stepLines = steps.map((step) => {
    const time = step.at === undefined ? "Prep" : formatDuration(step.at);
    return `${time} — ${step.instruction}`;
  });
  return [
    recipe.name,
    `by ${recipe.author}`,
    "",
    `${recipe.coffeeGrams}g coffee : ${recipe.waterGrams}g water${ratioText}`,
    `${toDisplayTemp(recipe.waterTempC, tempUnit)}${tempUnit} · ${METHOD_LABELS[recipe.method]} · ${GRIND_LABELS[recipe.grind]} grind`,
    "",
    ...stepLines,
  ].join("\n");
}

function scaledRecipe(
  original: Recipe | undefined,
  coffee: number | null,
  roast: Roast | null
): Recipe | undefined {
  if (!original) {
    return;
  }
  return scaleRecipe(
    original,
    coffee ?? original.coffeeGrams,
    roast ?? original.roast
  );
}

function nextTimedStep(steps: Step[], elapsed: number): number | null {
  const upcoming = steps
    .map((step) => step.at)
    .filter((at): at is number => at !== undefined && at > elapsed);
  return upcoming.length > 0 ? Math.min(...upcoming) : null;
}

function brewSummaryText(brews: BrewEntry[]): string | null {
  const last = brews[0];
  if (!last) {
    return null;
  }
  const filled = "★".repeat(last.rating);
  const empty = "☆".repeat(5 - last.rating);
  return `Brewed ${brews.length}× · last ${filled}${empty}`;
}

function Spec({
  label,
  unit,
  value,
}: {
  label: string;
  unit?: string;
  value: string;
}) {
  return (
    <View style={styles.spec}>
      <StyledText style={styles.specLabel}>{label}</StyledText>
      <StyledText style={styles.specValue}>
        {value}
        {unit ? <StyledText style={styles.specUnit}>{unit}</StyledText> : null}
      </StyledText>
    </View>
  );
}

const ROASTS: Roast[] = ["light", "medium", "dark"];

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: screen root orchestrating the timer, scaler, history, share and no-scale guide
export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getUserRecipe, addRecipe } = useUserRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { entries } = useBrewHistory();
  const original = useMemo(
    () => (id ? (getRecipe(id) ?? getUserRecipe(id)) : undefined),
    [id, getUserRecipe]
  );

  const [coffeeOverride, setCoffeeOverride] = useState<number | null>(null);
  const [roastOverride, setRoastOverride] = useState<Roast | null>(null);

  // Drop any adjustments when navigating to a different recipe (reset state
  // during render, per the React docs, rather than in an effect).
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setCoffeeOverride(null);
    setRoastOverride(null);
  }

  const recipe = useMemo(
    () => scaledRecipe(original, coffeeOverride, roastOverride),
    [original, coffeeOverride, roastOverride]
  );
  const steps = recipe?.steps ?? [];
  const modified =
    !!original &&
    !!recipe &&
    (recipe.coffeeGrams !== original.coffeeGrams ||
      recipe.roast !== original.roast);

  const { invertColors } = useInvertColors();
  const { defaultGrinder, keepAwake, tempUnit } = useSettings();
  const { addRecent } = useRecentlyViewed();
  const grinder = getGrinder(defaultGrinder);

  // Record this recipe as recently viewed.
  useEffect(() => {
    if (id) {
      addRecent(id);
    }
  }, [id, addRecent]);
  const { width } = useWindowDimensions();
  const { elapsed, running, activeIndex, toggle, reset, seek, total } =
    useBrewTimer(steps, recipe?.totalSeconds ?? 0);
  const [showNoScale, setShowNoScale] = useState(false);

  // Steps are authored in Celsius; convert any embedded temperatures for display.
  const displaySteps = useMemo(
    () =>
      steps.map((step) => ({
        ...step,
        instruction: convertStepTemps(step.instruction, tempUnit),
      })),
    [steps, tempUnit]
  );

  // Seconds until the next timed step (for the countdown + pre-cue).
  const nextStepAt = useMemo(
    () => nextTimedStep(steps, elapsed),
    [steps, elapsed]
  );
  const nextIn = nextStepAt === null ? null : nextStepAt - elapsed;

  const {
    handleScroll,
    scrollIndicatorHeight,
    scrollIndicatorPosition,
    setContentHeight,
    setScrollViewHeight,
  } = useScrollIndicator();

  const scrollRef = useRef<ScrollView>(null);
  const scrollWrapperRef = useRef<View>(null);
  const stepRefs = useRef<(View | null)[]>([]);
  const scrollOffset = useRef(0);

  useBrewCues({ running, activeIndex, elapsed, nextStepAt, keepAwake });

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
    handleScroll(event);
  };

  // Keep the active step parked just under the pinned timer as the brew
  // advances. The timer lives outside the scroll wrapper, so the wrapper's
  // top already sits below it and we only need a small breathing margin.
  useEffect(() => {
    if (activeIndex < 0) {
      return;
    }
    const node = stepRefs.current[activeIndex];
    const wrapper = scrollWrapperRef.current;
    if (!(node && wrapper)) {
      return;
    }
    node.measure((_x, _y, _w, _h, _px, pageY) => {
      wrapper.measure((_wx, _wy, _ww, _wh, _wpx, wrapperPageY) => {
        const stepTopInViewport = pageY - wrapperPageY;
        const delta = stepTopInViewport - n(16);
        const target = Math.max(scrollOffset.current + delta, 0);
        scrollRef.current?.scrollTo({ y: target, animated: true });
      });
    });
  }, [activeIndex]);

  if (!recipe) {
    return (
      <ContentContainer headerTitle="Recipe">
        <StyledText style={styles.message}>Recipe not found.</StyledText>
      </ContentContainer>
    );
  }

  const ratio =
    recipe.coffeeGrams > 0
      ? Math.round((recipe.waterGrams / recipe.coffeeGrams) * 10) / 10
      : null;
  const accent = invertColors ? "black" : "white";

  const brewSummary = brewSummaryText(
    entries.filter((entry) => entry.recipeId === recipe.id)
  );
  const ratioValue = ratio === null ? "-" : `1:${ratio}`;
  const clicksValue =
    grinder.id === "c40"
      ? `${recipe.c40Clicks}`
      : `~${grinderClicks(recipe.c40Clicks, grinder)}`;
  const timerNextIn = running ? nextIn : null;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const adjustCoffee = (delta: number) => {
    setCoffeeOverride(recipe.coffeeGrams + delta);
  };

  const resetToOriginal = () => {
    setCoffeeOverride(null);
    setRoastOverride(null);
    reset();
  };

  const handleSaveAsMine = () => {
    if (!recipe) {
      return;
    }
    const newId = `mix-${Date.now()}`;
    addRecipe({ ...recipe, id: newId, name: `${recipe.name} (my mix)` });
    router.replace({ pathname: "/recipe", params: { id: newId } });
  };

  const handleShare = () => {
    Share.share({
      message: buildShareText(recipe, ratio, tempUnit, displaySteps),
    });
  };

  return (
    <SwipeBackContainer enabled onSwipeBack={handleBack}>
      <View
        style={[
          styles.container,
          { backgroundColor: invertColors ? "white" : "black" },
        ]}
      >
        <Header
          headerTitle={recipe.name}
          rightAction={{
            icon: isFavorite(recipe.id) ? "favorite" : "favorite-border",
            onPress: () => toggleFavorite(recipe.id),
          }}
        />
        <BrewTimer
          elapsed={elapsed}
          nextIn={timerNextIn}
          onReset={reset}
          onToggle={toggle}
          running={running}
          total={total}
        />
        <View ref={scrollWrapperRef} style={styles.scrollWrapper}>
          <Animated.ScrollView
            contentContainerStyle={[styles.content, { width }]}
            onContentSizeChange={(_, height) => setContentHeight(height)}
            onLayout={(event) =>
              setScrollViewHeight(event.nativeEvent.layout.height)
            }
            onScroll={onScroll}
            overScrollMode="never"
            ref={scrollRef}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            <StyledText style={[styles.row, styles.author]}>
              {recipe.author}
            </StyledText>
            <StyledText style={[styles.row, styles.blurb]}>
              {recipe.blurb}
            </StyledText>
            {brewSummary ? (
              <StyledText style={[styles.row, styles.brewSummary]}>
                {brewSummary}
              </StyledText>
            ) : null}
            <View style={[styles.row, styles.adjust]}>
              <View style={styles.adjustRow}>
                <StyledText style={styles.adjustLabel}>Coffee</StyledText>
                <View style={styles.stepper}>
                  <HapticPressable
                    onPress={() => adjustCoffee(-1)}
                    style={styles.stepButton}
                  >
                    <StyledText style={styles.stepSign}>−</StyledText>
                  </HapticPressable>
                  <StyledText style={styles.stepValue}>
                    {recipe.coffeeGrams}
                    <StyledText style={styles.stepUnit}>g</StyledText>
                  </StyledText>
                  <HapticPressable
                    onPress={() => adjustCoffee(1)}
                    style={styles.stepButton}
                  >
                    <StyledText style={styles.stepSign}>+</StyledText>
                  </HapticPressable>
                </View>
              </View>
              <View style={styles.adjustRow}>
                <StyledText style={styles.adjustLabel}>Roast</StyledText>
                <View style={styles.roastGroup}>
                  {ROASTS.map((roastOption) => (
                    <HapticPressable
                      key={roastOption}
                      onPress={() => setRoastOverride(roastOption)}
                    >
                      <StyledText
                        style={[
                          styles.roastOption,
                          recipe.roast === roastOption
                            ? styles.roastActive
                            : styles.roastIdle,
                        ]}
                      >
                        {ROAST_LABELS[roastOption]}
                      </StyledText>
                    </HapticPressable>
                  ))}
                </View>
              </View>
              {modified ? (
                <View style={styles.adjustActions}>
                  <HapticPressable onPress={resetToOriginal}>
                    <StyledText style={styles.resetLink}>
                      Reset to original
                    </StyledText>
                  </HapticPressable>
                  <HapticPressable onPress={handleSaveAsMine}>
                    <StyledText style={styles.resetLink}>
                      Save as my recipe
                    </StyledText>
                  </HapticPressable>
                </View>
              ) : null}
            </View>
            <View style={[styles.row, styles.specs]}>
              <Spec label="Water" value={`${recipe.waterGrams}g`} />
              <Spec label="Ratio" value={ratioValue} />
              <Spec
                label="Temp"
                unit={tempUnit}
                value={`${toDisplayTemp(recipe.waterTempC, tempUnit)}`}
              />
              <Spec label="Time" value={formatDuration(recipe.totalSeconds)} />
              <Spec label="Method" value={METHOD_LABELS[recipe.method]} />
              <Spec label="Grind" value={GRIND_LABELS[recipe.grind]} />
              {recipe.orientation ? (
                <Spec
                  label="Orientation"
                  value={ORIENTATION_LABELS[recipe.orientation]}
                />
              ) : null}
              <Spec label={grinder.clicksLabel} value={clicksValue} />
            </View>
            <HapticPressable
              onPress={() => setShowNoScale((value) => !value)}
              style={[styles.row, styles.toggle]}
            >
              <StyledText style={styles.sectionTitle}>
                Without a scale
              </StyledText>
              <StyledText style={styles.toggleHint}>
                {showNoScale ? "Hide" : "Show"}
              </StyledText>
            </HapticPressable>
            <View style={styles.row}>
              {showNoScale ? (
                <BrewVisual
                  coffeeGrams={recipe.coffeeGrams}
                  method={recipe.method}
                  waterGrams={recipe.waterGrams}
                />
              ) : null}
            </View>
            {recipe.notes ? (
              <>
                <StyledText style={[styles.row, styles.sectionTitle]}>
                  Notes
                </StyledText>
                <StyledText style={[styles.row, styles.notes]}>
                  {recipe.notes}
                </StyledText>
              </>
            ) : null}
            <StyledText style={[styles.row, styles.sectionTitle]}>
              Steps
            </StyledText>
            <BrewSteps
              activeIndex={activeIndex}
              onSeek={seek}
              onStepRef={(index, node) => {
                stepRefs.current[index] = node;
              }}
              steps={displaySteps}
            />
            <View style={[styles.row, styles.bottomActions]}>
              <HapticPressable
                onPress={() => router.push(`/log-brew?id=${id}` as Href)}
              >
                <StyledText style={styles.shareLink}>Log this brew</StyledText>
              </HapticPressable>
              <HapticPressable onPress={handleShare}>
                <StyledText style={styles.shareLink}>Share recipe</StyledText>
              </HapticPressable>
            </View>
            <View style={styles.bottomSpacer} />
          </Animated.ScrollView>
          {scrollIndicatorHeight > 0 && (
            <View
              style={[styles.scrollIndicatorTrack, { backgroundColor: accent }]}
            >
              <Animated.View
                style={[
                  styles.scrollIndicatorThumb,
                  { backgroundColor: accent },
                  {
                    height: scrollIndicatorHeight,
                    transform: [{ translateY: scrollIndicatorPosition }],
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    gap: n(14),
  },
  scrollWrapper: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    position: "relative",
    paddingBottom: n(20),
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  content: {
    gap: n(28),
    paddingTop: n(4),
  },
  row: {
    width: "100%",
    paddingLeft: n(37),
    paddingRight: n(46),
  },
  author: {
    fontSize: n(18),
  },
  blurb: {
    fontSize: n(20),
    lineHeight: n(28),
  },
  notes: {
    fontSize: n(18),
    lineHeight: n(26),
    opacity: 0.75,
  },
  shareLink: {
    fontSize: n(20),
    opacity: 0.7,
    textDecorationLine: "underline",
  },
  bottomActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: n(24),
  },
  brewSummary: {
    fontSize: n(16),
    opacity: 0.6,
  },
  adjust: {
    width: "100%",
    gap: n(18),
  },
  adjustRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: n(12),
  },
  adjustLabel: {
    fontSize: n(20),
    opacity: 0.6,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: n(22),
  },
  stepButton: {
    minWidth: n(34),
    alignItems: "center",
  },
  stepSign: {
    fontSize: n(34),
  },
  stepValue: {
    fontSize: n(26),
    minWidth: n(64),
    textAlign: "center",
  },
  stepUnit: {
    fontSize: n(16),
    opacity: 0.7,
  },
  roastGroup: {
    flexDirection: "row",
    gap: n(18),
  },
  roastOption: {
    fontSize: n(20),
  },
  roastActive: {
    opacity: 1,
    textDecorationLine: "underline",
  },
  roastIdle: {
    opacity: 0.4,
  },
  adjustActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: n(24),
  },
  resetLink: {
    fontSize: n(18),
    opacity: 0.6,
    textDecorationLine: "underline",
  },
  specs: {
    width: "100%",
    gap: n(14),
  },
  spec: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: n(12),
  },
  specLabel: {
    fontSize: n(20),
    opacity: 0.6,
  },
  specValue: {
    fontSize: n(24),
  },
  specUnit: {
    fontSize: n(16),
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: n(30),
  },
  toggle: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: n(12),
  },
  toggleHint: {
    fontSize: n(18),
    opacity: 0.6,
  },
  message: {
    fontSize: n(24),
  },
  bottomSpacer: {
    height: n(60),
  },
  scrollIndicatorTrack: {
    width: n(1),
    height: "100%",
    position: "absolute",
    right: n(34),
  },
  scrollIndicatorThumb: {
    width: n(5),
    position: "absolute",
    right: n(-2),
  },
});
