import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { useLeaderboard } from "@/hooks/useGameState";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius, GameColors } from "@/constants/theme";

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { leaderboard, isLoading } = useLeaderboard();
  const { user } = useAuth();

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "#FFD700";
      case 2: return "#C0C0C0";
      case 3: return "#CD7F32";
      default: return Colors.dark.textSecondary;
    }
  };

  const renderPlayer = ({ item }: { item: any }) => {
    const isCurrentUser = item.username === user?.username;
    const isTopThree = item.rank <= 3;

    return (
      <View
        style={[
          styles.playerItem,
          isTopThree && styles.topThree,
          item.rank === 1 && styles.firstPlace,
          isCurrentUser && styles.currentUser,
        ]}
      >
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <ThemedText style={styles.rankText}>{item.rank}</ThemedText>
        </View>
        <View style={styles.playerInfo}>
          <ThemedText style={styles.playerName}>
            {item.username} {isCurrentUser && "(You)"}
          </ThemedText>
        </View>
        <View style={styles.playerBalance}>
          <ThemedText style={[styles.balanceText, { color: GameColors.coinGold }]}>
            {item.balance.toLocaleString()}
          </ThemedText>
          <ThemedText style={styles.coinLabel}>coins</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
        leaderboard.length === 0 && styles.emptyContent,
      ]}
      data={leaderboard}
      renderItem={renderPlayer}
      keyExtractor={(item) => item.rank.toString()}
      ListEmptyComponent={
        <EmptyState
          image={require("../../assets/images/trophy.png")}
          title="No players yet"
          subtitle="Be the first to top the leaderboard!"
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
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  topThree: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  firstPlace: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  currentUser: {
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderWidth: 2,
    borderColor: GameColors.green,
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
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  playerBalance: {
    alignItems: "flex-end",
  },
  balanceText: {
    fontSize: 18,
    fontWeight: "700",
  },
  coinLabel: {
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
});
