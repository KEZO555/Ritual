// LightOS design tokens, mirrored from the light-sdk's LightTheme.kt
// (sdk/ui/.../LightTheme.kt). LightOS renders secondary content in a real
// gray rather than fading white/black with opacity.
export interface ThemeColors {
  background: string;
  content: string;
  contentSecondary: string;
}

const DARK: ThemeColors = {
  background: "black",
  content: "white",
  contentSecondary: "#BBBBBB",
};

const LIGHT: ThemeColors = {
  background: "white",
  content: "black",
  contentSecondary: "#666666",
};

export function themeColors(invertColors: boolean): ThemeColors {
  return invertColors ? LIGHT : DARK;
}
