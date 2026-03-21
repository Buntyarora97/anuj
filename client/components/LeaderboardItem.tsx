import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, Colors, Spacing, BorderRadius } from "@/constants/theme";
import { LeaderboardEntry } from "@/constants/game";

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
}

export function LeaderboardItem({ entry }: LeaderboardItemProps) {
  const getRankColor = () => {
    switch (entry.rank) {
      case 1:
        return "#FFD700";
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return Colors.dark.textSecondary;
    }
  };

  const isTopThree = entry.rank <= 3;

  return (
    <View
      style={[
        styles.container,
        isTopThree && styles.topThree,
        entry.rank === 1 && styles.firstPlace,
      ]}
    >
      <View style={[styles.rankBadge, { backgroundColor: getRankColor() }]}>
        <ThemedText style={styles.rankText}>{entry.rank}</ThemedText>
      </View>
      <View style={styles.nameSection}>
        <ThemedText style={styles.name}>{entry.name}</ThemedText>
      </View>
      <View style={styles.balanceSection}>
        <ThemedText style={[styles.balance, { color: GameColors.coinGold }]}>
          {entry.balance.toLocaleString()}
        </ThemedText>
        <ThemedText style={styles.coinLabel}>coins</ThemedText>
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
  topThree: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  firstPlace: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  balanceSection: {
    alignItems: "flex-end",
  },
  balance: {
    fontSize: 18,
    fontWeight: "700",
  },
  coinLabel: {
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
});
