import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Colors } from "@/constants/theme";
import { GameColor, GAME_CONFIG } from "@/constants/game";

interface ColorBetButtonProps {
  color: GameColor;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ColorBetButton({
  color,
  isSelected,
  onPress,
  disabled,
}: ColorBetButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isSelected) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 600 }),
          withTiming(0.3, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isSelected]);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const buttonColor =
    color === "red"
      ? GameColors.red
      : color === "yellow"
        ? GameColors.yellow
        : GameColors.green;

  const colorLabel = color.charAt(0).toUpperCase() + color.slice(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, animatedStyle]}
      testID={`bet-button-${color}`}
    >
      <Animated.View
        style={[styles.glow, { backgroundColor: buttonColor }, glowStyle]}
      />
      <View
        style={[
          styles.button,
          { backgroundColor: buttonColor },
          disabled && styles.disabled,
          isSelected && styles.selected,
        ]}
      >
        <ThemedText style={styles.label}>{colorLabel}</ThemedText>
        <ThemedText style={styles.multiplier}>
          x{GAME_CONFIG.WIN_MULTIPLIER}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 70,
  },
  glow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: BorderRadius.xl + 4,
    opacity: 0,
  },
  button: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  selected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  multiplier: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
});
