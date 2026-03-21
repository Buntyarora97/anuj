import React from "react";
import { View, StyleSheet, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

interface CoinDisplayProps {
  balance: number;
  compact?: boolean;
}

export function CoinDisplay({ balance, compact = false }: CoinDisplayProps) {
  const scale = useSharedValue(1);
  const prevBalance = React.useRef(balance);

  React.useEffect(() => {
    if (balance !== prevBalance.current) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      prevBalance.current = balance;
    }
  }, [balance]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.container, compact && styles.compact, animatedStyle]}
    >
      <Image
        source={require("../../assets/images/coin-stack.png")}
        style={[styles.coinIcon, compact && styles.coinIconCompact]}
        resizeMode="contain"
      />
      <ThemedText
        style={[
          styles.balance,
          compact && styles.balanceCompact,
          { color: GameColors.coinGold },
        ]}
      >
        {balance.toLocaleString()}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  compact: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  coinIcon: {
    width: 24,
    height: 24,
  },
  coinIconCompact: {
    width: 18,
    height: 18,
  },
  balance: {
    fontSize: 18,
    fontWeight: "700",
  },
  balanceCompact: {
    fontSize: 14,
  },
});
