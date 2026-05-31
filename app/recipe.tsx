import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
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
import { useFavorites } from "@/contexts/FavoritesContext";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useUserRecipes } from "@/contexts/UserRecipesContext";
import {
  formatDuration,
  GRIND_LABELS,
  getRecipe,
  METHOD_LABELS,
  ORIENTATION_LABELS,
  ROAST_LABELS,
} from "@/data/recipes";
import { useBrewTimer } from "@/hooks/useBrewTimer";
import { useScrollIndicator } from "@/hooks/useScrollIndicator";
import { triggerStepHaptic } from "@/utils/haptics";
import { n } from "@/utils/scaling";

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.spec}>
      <StyledText style={styles.specLabel}>{label}</StyledText>
      <StyledText style={styles.specValue}>{value}</StyledText>
    </View>
  );
}

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getUserRecipe } = useUserRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();
  const recipe = id ? (getRecipe(id) ?? getUserRecipe(id)) : undefined;
  const steps = recipe?.steps ?? [];

  const { invertColors } = useInvertColors();
  const { width } = useWindowDimensions();
  const { elapsed, running, activeIndex, toggle, reset, seek, total } =
    useBrewTimer(steps, recipe?.totalSeconds ?? 0);
  const [showNoScale, setShowNoScale] = useState(false);

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
  const buzzedIndex = useRef(-1);

  // Buzz when the running brew advances to a new step so it's noticeable
  // without watching the screen. Taps/seeks already give their own feedback.
  useEffect(() => {
    if (running && activeIndex >= 0 && activeIndex !== buzzedIndex.current) {
      triggerStepHaptic();
    }
    buzzedIndex.current = activeIndex;
  }, [running, activeIndex]);

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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
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
            <View style={[styles.row, styles.specs]}>
              <Spec label="Coffee" value={`${recipe.coffeeGrams}g`} />
              <Spec label="Water" value={`${recipe.waterGrams}g`} />
              <Spec label="Ratio" value={ratio === null ? "-" : `1:${ratio}`} />
              <Spec label="Temp" value={`${recipe.waterTempC}C`} />
              <Spec label="Time" value={formatDuration(recipe.totalSeconds)} />
              <Spec label="Method" value={METHOD_LABELS[recipe.method]} />
              <Spec label="Roast" value={ROAST_LABELS[recipe.roast]} />
              <Spec label="Grind" value={GRIND_LABELS[recipe.grind]} />
              {recipe.orientation ? (
                <Spec
                  label="Orientation"
                  value={ORIENTATION_LABELS[recipe.orientation]}
                />
              ) : null}
              <Spec label="C40 clicks" value={`${recipe.c40Clicks}`} />
            </View>
            {recipe.method === "aeropress" ? (
              <>
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
                      waterGrams={recipe.waterGrams}
                    />
                  ) : null}
                </View>
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
              steps={recipe.steps}
            />
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
