import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { BrewMethod, TempUnit } from "@/data/recipes";
import { usePersistedState } from "@/hooks/usePersistedState";
import { setHapticsEnabled as syncHapticsEnabled } from "@/utils/haptics";
import { setStepSoundEnabled as syncStepSoundEnabled } from "@/utils/sound";

interface SettingsContextType {
  defaultGrinder: string;
  defaultMethod: BrewMethod;
  hapticsEnabled: boolean;
  keepAwake: boolean;
  setDefaultGrinder: (value: string) => Promise<void>;
  setDefaultMethod: (value: BrewMethod) => Promise<void>;
  setHapticsEnabled: (value: boolean) => Promise<void>;
  setKeepAwake: (value: boolean) => Promise<void>;
  setStepSound: (value: boolean) => Promise<void>;
  setTempUnit: (value: TempUnit) => Promise<void>;
  stepSound: boolean;
  tempUnit: TempUnit;
}

const throwOutsideProvider = () => {
  throw new Error("useSettings must be used within SettingsProvider");
};

const SettingsContext = createContext<SettingsContextType>({
  defaultGrinder: "c40",
  defaultMethod: "aeropress",
  hapticsEnabled: true,
  keepAwake: true,
  setDefaultGrinder: throwOutsideProvider,
  setDefaultMethod: throwOutsideProvider,
  setHapticsEnabled: throwOutsideProvider,
  setKeepAwake: throwOutsideProvider,
  setStepSound: throwOutsideProvider,
  setTempUnit: throwOutsideProvider,
  stepSound: false,
  tempUnit: "C",
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [tempUnit, setTempUnit] = usePersistedState<TempUnit>("tempUnit", "C");
  const [hapticsEnabled, setHapticsEnabled] = usePersistedState(
    "hapticsEnabled",
    true
  );
  const [keepAwake, setKeepAwake] = usePersistedState("keepAwake", true);
  const [defaultMethod, setDefaultMethod] = usePersistedState<BrewMethod>(
    "defaultMethod",
    "aeropress"
  );
  const [defaultGrinder, setDefaultGrinder] = usePersistedState(
    "defaultGrinder",
    "c40"
  );
  const [stepSound, setStepSound] = usePersistedState("stepSound", false);

  // Mirror the haptics setting into the plain util module the press handlers use.
  useEffect(() => {
    syncHapticsEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  // Mirror the step-sound setting into the sound util.
  useEffect(() => {
    syncStepSoundEnabled(stepSound);
  }, [stepSound]);

  return (
    <SettingsContext.Provider
      value={{
        defaultGrinder,
        defaultMethod,
        hapticsEnabled,
        keepAwake,
        setDefaultGrinder,
        setDefaultMethod,
        setHapticsEnabled,
        setKeepAwake,
        setStepSound,
        setTempUnit,
        stepSound,
        tempUnit,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
