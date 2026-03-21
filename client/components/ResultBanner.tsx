import React from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInUp,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, Colors, Spacing, BorderRadius } from "@/constants/theme";
import { GameRound } from "@/constants/game";

interface ResultBannerProps {
  lastRound: GameRound | null;
  visible: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ResultBanner({ lastRound, visible }: ResultBannerProps) {
  if (!visible || !lastRound) return null;

  const resultColor =
    lastRound.resultColor === "red"
      ? GameColors.red
      : lastRound.resultColor === "yellow"
        ? GameColors.yellow
        : GameColors.green;

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(15).stiffness(100)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      {lastRound.won && (
        <Image
          source={require("../../assets/images/celebration-burst.png")}
          style={styles.celebration}
          resizeMode="contain"
        />
      )}
      <View
        style={[
          styles.banner,
          {
            borderColor: resultColor,
            backgroundColor: lastRound.won
              ? "rgba(52, 199, 89, 0.2)"
              : "rgba(255, 59, 48, 0.2)",
          },
        ]}
      >
        <View style={styles.resultRow}>
          <View
            style={[styles.colorDot, { backgroundColor: resultColor }]}
          />
          <ThemedText style={styles.resultText}>
            {lastRound.resultColor.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.outcomeText,
            { color: lastRound.won ? GameColors.green : GameColors.red },
          ]}
        >
          {lastRound.won ? "YOU WON!" : "Better luck next time"}
        </ThemedText>
        <ThemedText
          style={[
            styles.coinsChange,
            { color: lastRound.won ? GameColors.coinGold : GameColors.red },
          ]}
        >
          {lastRound.won ? "+" : ""}
          {lastRound.coinsChange.toLocaleString()} coins
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 100,
    alignItems: "center",
  },
  celebration: {
    position: "absolute",
    width: 200,
    height: 200,
    top: -60,
    opacity: 0.8,
  },
  banner: {
    width: "100%",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 24,
    fontWeight: "700",
  },
  outcomeText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  coinsChange: {
    fontSize: 18,
    fontWeight: "600",
  },
});
