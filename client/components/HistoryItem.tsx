import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, Colors, Spacing, BorderRadius } from "@/constants/theme";
import { GameRound } from "@/constants/game";

interface HistoryItemProps {
  round: GameRound;
  index: number;
}

export function HistoryItem({ round, index }: HistoryItemProps) {
  const betColor =
    round.betColor === "red"
      ? GameColors.red
      : round.betColor === "yellow"
        ? GameColors.yellow
        : GameColors.green;

  const resultColor =
    round.resultColor === "red"
      ? GameColors.red
      : round.resultColor === "yellow"
        ? GameColors.yellow
        : GameColors.green;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <ThemedText style={styles.roundNumber}>#{index + 1}</ThemedText>
        <ThemedText style={styles.time}>{formatTime(round.timestamp)}</ThemedText>
      </View>
      <View style={styles.colorsSection}>
        <View style={styles.colorRow}>
          <ThemedText style={styles.colorLabel}>Bet:</ThemedText>
          <View style={[styles.colorDot, { backgroundColor: betColor }]} />
        </View>
        <View style={styles.colorRow}>
          <ThemedText style={styles.colorLabel}>Result:</ThemedText>
          <View style={[styles.colorDot, { backgroundColor: resultColor }]} />
        </View>
      </View>
      <View style={styles.rightSection}>
        <ThemedText
          style={[
            styles.outcome,
            { color: round.won ? GameColors.green : GameColors.red },
          ]}
        >
          {round.won ? "WON" : "LOST"}
        </ThemedText>
        <ThemedText
          style={[
            styles.coins,
            { color: round.won ? GameColors.coinGold : GameColors.red },
          ]}
        >
          {round.won ? "+" : ""}
          {round.coinsChange}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  leftSection: {
    marginRight: Spacing.lg,
  },
  roundNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  time: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  colorsSection: {
    flex: 1,
    gap: Spacing.xs,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  colorLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    width: 40,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  outcome: {
    fontSize: 14,
    fontWeight: "700",
  },
  coins: {
    fontSize: 14,
    fontWeight: "600",
  },
});
