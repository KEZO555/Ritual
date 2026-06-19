import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect, useRef } from "react";
import { triggerHaptic, triggerStepHaptic } from "@/utils/haptics";
import { playStepSound } from "@/utils/sound";

const KEEP_AWAKE_TAG = "brew-timer";
const PRECUE_SECONDS = 3;

interface BrewCuesParams {
  activeIndex: number;
  elapsed: number;
  keepAwake: boolean;
  nextStepAt: number | null;
  running: boolean;
}

// Haptic/sound cues and screen-wake tied to the brew timer:
// - a strong cue when the brew advances to a new step,
// - a light heads-up a few seconds before each step,
// - keeping the screen awake while running (when enabled).
export function useBrewCues({
  running,
  activeIndex,
  elapsed,
  nextStepAt,
  keepAwake,
}: BrewCuesParams) {
  const buzzedIndex = useRef(-1);
  const precuedAt = useRef(-1);

  useEffect(() => {
    if (running && activeIndex >= 0 && activeIndex !== buzzedIndex.current) {
      triggerStepHaptic();
      playStepSound();
    }
    buzzedIndex.current = activeIndex;
  }, [running, activeIndex]);

  useEffect(() => {
    if (!running) {
      precuedAt.current = -1;
      return;
    }
    if (
      nextStepAt !== null &&
      nextStepAt - elapsed <= PRECUE_SECONDS &&
      precuedAt.current !== nextStepAt
    ) {
      triggerHaptic();
      precuedAt.current = nextStepAt;
    }
  }, [running, elapsed, nextStepAt]);

  useEffect(() => {
    if (!(running && keepAwake)) {
      return;
    }
    activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [running, keepAwake]);
}
