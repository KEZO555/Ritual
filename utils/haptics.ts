import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";

export const triggerHaptic = () => impactAsync(ImpactFeedbackStyle.Light);

// A firmer cue for when the brew advances to a new step, so it's felt
// without looking at the screen mid-pour.
export const triggerStepHaptic = () => impactAsync(ImpactFeedbackStyle.Medium);
