import type React from "react";
import { Text as DefaultText, StyleSheet, type TextProps } from "react-native";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { themeColors } from "@/utils/lightTheme";

interface StyledTextProps extends TextProps {
  children: React.ReactNode;
}

// Faded text at or above this opacity is really "secondary content"; LightOS
// renders it in the theme's secondary gray instead of fading the foreground.
const SECONDARY_OPACITY_MIN = 0.4;

export function StyledText({ style, ...rest }: StyledTextProps) {
  const { invertColors } = useInvertColors();
  const colors = themeColors(invertColors);

  const flat = StyleSheet.flatten(style) ?? {};
  const isSecondary =
    typeof flat.opacity === "number" &&
    flat.opacity >= SECONDARY_OPACITY_MIN &&
    flat.opacity < 1;

  return (
    <DefaultText
      allowFontScaling={false}
      style={[
        styles.text,
        { color: colors.content },
        style,
        isSecondary && { color: colors.contentSecondary, opacity: 1 },
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "PublicSans-Regular",
  },
});
