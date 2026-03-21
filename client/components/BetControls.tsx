import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import {
  GameColors,
  Spacing,
  BorderRadius,
  Colors,
} from "@/constants/theme";
import { GAME_CONFIG } from "@/constants/game";

interface BetControlsProps {
  currentBet: number;
  maxBet: number;
  onAdjust: (delta: number) => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function BetButton({
  icon,
  onPress,
  disabled,
}: {
  icon: "minus" | "plus";
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        animatedStyle,
      ]}
      testID={`bet-${icon}`}
    >
      <Feather
        name={icon}
        size={24}
        color={disabled ? Colors.dark.textMuted : "#FFFFFF"}
      />
    </AnimatedPressable>
  );
}

export function BetControls({
  currentBet,
  maxBet,
  onAdjust,
  disabled,
}: BetControlsProps) {
  const canDecrease = currentBet > GAME_CONFIG.MIN_BET && !disabled;
  const canIncrease = currentBet < Math.min(GAME_CONFIG.MAX_BET, maxBet) && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.betStartRow}>
        <ThemedText style={styles.label}>Bet Amount</ThemedText>
        <Feather name="arrow-left" size={16} color={Colors.dark.textSecondary} style={{ marginHorizontal: 10 }} />
        <ThemedText style={styles.betStartLabel}>Bet Start 10 Rs</ThemedText>
      </View>
      <View style={styles.controls}>
        <BetButton
          icon="minus"
          onPress={() => onAdjust(-GAME_CONFIG.BET_INCREMENT)}
          disabled={!canDecrease}
        />
        <View style={styles.betDisplay}>
          <ThemedText style={[styles.betAmount, { color: GameColors.coinGold }]}>
            {currentBet}
          </ThemedText>
          <ThemedText style={styles.coinLabel}>coins</ThemedText>
        </View>
        <BetButton
          icon="plus"
          onPress={() => onAdjust(GAME_CONFIG.BET_INCREMENT)}
          disabled={!canIncrease}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  betStartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  betStartLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  betDisplay: {
    alignItems: "center",
    minWidth: 80,
  },
  betAmount: {
    fontSize: 28,
    fontWeight: "700",
  },
  coinLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
});
