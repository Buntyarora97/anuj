import { Platform } from "react-native";

export const GameColors = {
  red: "#FF3B30",
  yellow: "#FFCC00",
  green: "#34C759",
  coinGold: "#FFD700",
  neonGlow: "rgba(255, 255, 255, 0.3)",
};

export const Colors = {
  light: {
    text: "#FFFFFF",
    textSecondary: "#A0A6C8",
    textMuted: "#6B7199",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7199",
    tabIconSelected: "#FFFFFF",
    link: "#0A84FF",
    backgroundRoot: "#0A0E27",
    backgroundDefault: "#1A1F3A",
    backgroundSecondary: "#252B4A",
    backgroundTertiary: "#303654",
    success: "#34C759",
    error: "#FF3B30",
    warning: "#FFCC00",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#A0A6C8",
    textMuted: "#6B7199",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7199",
    tabIconSelected: "#FFFFFF",
    link: "#0A84FF",
    backgroundRoot: "#0A0E27",
    backgroundDefault: "#1A1F3A",
    backgroundSecondary: "#252B4A",
    backgroundTertiary: "#303654",
    success: "#34C759",
    error: "#FF3B30",
    warning: "#FFCC00",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  mega: {
    fontSize: 72,
    lineHeight: 80,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
