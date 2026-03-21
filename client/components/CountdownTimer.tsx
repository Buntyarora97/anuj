import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, GameColors } from "@/constants/theme";

interface CountdownTimerProps {
  countdown: number;
  phase: "betting" | "waiting" | "result";
}

export function CountdownTimer({ countdown, phase }: CountdownTimerProps) {
  const scale = useSharedValue(1);
  const prevCountdown = React.useRef(countdown);

  React.useEffect(() => {
    if (countdown !== prevCountdown.current && countdown <= 5) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) })
      );
    }
    prevCountdown.current = countdown;
  }, [countdown]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getPhaseLabel = () => {
    switch (phase) {
      case "betting":
        return "Place your bet!";
      case "waiting":
        return "Betting closed...";
      case "result":
        return "Result!";
      default:
        return "";
    }
  };

  const getTimerColor = () => {
    if (phase === "result") return GameColors.green;
    if (phase === "waiting" || countdown <= 3) return GameColors.red;
    if (countdown <= 5) return GameColors.yellow;
    return "#FFFFFF";
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.phaseLabel}>{getPhaseLabel()}</ThemedText>
      <Animated.View style={animatedStyle}>
        <ThemedText style={[styles.countdown, { color: getTimerColor() }]}>
          {countdown}
        </ThemedText>
      </Animated.View>
      <ThemedText style={styles.secondsLabel}>
        {phase === "result" ? "Next round" : "seconds"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
  },
  phaseLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  countdown: {
    ...Typography.mega,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  secondsLabel: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: Spacing.xs,
  },
});
