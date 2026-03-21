import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { useUserBets } from "@/hooks/useGameState";
import { Colors, Spacing, BorderRadius, GameColors } from "@/constants/theme";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { bets, isLoading } = useUserBets();

  const getColorValue = (color: string) => {
    switch (color) {
      case "red": return GameColors.red;
      case "yellow": return GameColors.yellow;
      case "green": return GameColors.green;
      default: return Colors.dark.textMuted;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderBet = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.betItem}>
      <View style={styles.betLeft}>
        <ThemedText style={styles.betIndex}>#{bets.length - index}</ThemedText>
        <ThemedText style={styles.betDate}>{formatDate(item.createdAt)}</ThemedText>
      </View>
      <View style={styles.betCenter}>
        <View style={styles.colorRow}>
          <ThemedText style={styles.colorLabel}>Bet:</ThemedText>
          <View style={[styles.colorDot, { backgroundColor: getColorValue(item.betColor) }]} />
        </View>
      </View>
      <View style={styles.betRight}>
        {item.won !== null ? (
          <>
            <ThemedText
              style={[
                styles.betOutcome,
                { color: item.won ? GameColors.green : GameColors.red },
              ]}
            >
              {item.won ? "WON" : "LOST"}
            </ThemedText>
            <ThemedText
              style={[
                styles.betAmount,
                { color: item.won ? GameColors.coinGold : GameColors.red },
              ]}
            >
              {item.won ? `+${item.winAmount}` : `-${item.betAmount}`}
            </ThemedText>
          </>
        ) : (
          <ThemedText style={styles.betPending}>Pending</ThemedText>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
        bets.length === 0 && styles.emptyContent,
      ]}
      data={bets}
      renderItem={renderBet}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={
        <EmptyState
          image={require("../../assets/images/traffic-light-history.png")}
          title="No bets yet"
          subtitle="Place your first bet to see your history here"
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyContent: {
    flex: 1,
  },
  betItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  betLeft: {
    marginRight: Spacing.lg,
  },
  betIndex: {
    fontSize: 14,
    fontWeight: "600",
  },
  betDate: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  betCenter: {
    flex: 1,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  colorLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  betRight: {
    alignItems: "flex-end",
  },
  betOutcome: {
    fontSize: 12,
    fontWeight: "700",
  },
  betAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  betPending: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontStyle: "italic",
  },
});
