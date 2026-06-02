import { createAudioPlayer } from "expo-audio";

// Toggled by the user's "Step Sound" setting (default off). The settings
// provider syncs the persisted value on launch.
let stepSoundEnabled = false;
let player: ReturnType<typeof createAudioPlayer> | null = null;

export const setStepSoundEnabled = (value: boolean) => {
  stepSoundEnabled = value;
};

// Play a short cue when the brew advances to a new step. The player is created
// lazily so audio isn't initialised until the sound is first enabled/used.
export const playStepSound = () => {
  if (!stepSoundEnabled) {
    return;
  }
  if (!player) {
    player = createAudioPlayer(require("@/assets/sounds/step.wav"));
  }
  player.seekTo(0);
  player.play();
};
