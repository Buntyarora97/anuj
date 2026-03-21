import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { TrafficLight } from "@/components/TrafficLight";
import { CoinDisplay } from "@/components/CoinDisplay";
import { BetControls } from "@/components/BetControls";
import { ColorBetButton } from "@/components/ColorBetButton";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useAuth } from "@/hooks/useAuth";
import { useGameState } from "@/hooks/useGameState";
import { Colors, Spacing, BorderRadius, GameColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const COLORS = ["red", "yellow", "green"] as const;

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user, refreshUser } = useAuth();
  const { gameState, isLoading, placeBet, isBetting } = useGameState();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [betPlaced, setBetPlaced] = useState(false);

  React.useEffect(() => {
    if (gameState?.phase === "betting" && betPlaced) {
      setBetPlaced(false);
      setSelectedColor(null);
    }
  }, [gameState?.phase]);

  const handleColorSelect = useCallback((color: string) => {
    if (gameState?.phase !== "betting" || betPlaced) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedColor((prev) => (prev === color ? null : color));
  }, [gameState?.phase, betPlaced]);

  const handlePlaceBet = async () => {
    if (!selectedColor || betPlaced || gameState?.phase !== "betting") return;
    if (!user || user.balance < betAmount) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await placeBet(selectedColor, betAmount);
      setBetPlaced(true);
      await refreshUser();
    } catch (e) {
      console.error("Bet error:", e);
    }
  };

  const adjustBet = (delta: number) => {
    setBetAmount((prev) => {
      const newAmount = prev + delta;
      if (newAmount < 10) return 10;
      if (newAmount > Math.min(10000, user?.balance ?? 0)) return prev;
      Haptics.selectionAsync();
      return newAmount;
    });
  };

  if (isLoading || !gameState) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  const getColorForResult = (color: string) => {
    switch (color) {
      case "red": return GameColors.red;
      case "yellow": return GameColors.yellow;
      case "green": return GameColors.green;
      default: return Colors.dark.textMuted;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Feather name="menu" size={24} color="#FFF" />
        </Pressable>

        <Image 
          source={require("../../assets/images/logo.png")} 
          style={styles.logo} 
          resizeMode="contain" 
        />

        <CoinDisplay balance={user?.balance ?? 0} compact />
      </View>

      <View style={styles.walletBar}>
        <Pressable
          style={styles.walletButton}
          onPress={() => navigation.navigate("Wallet")}
        >
          <Feather name="plus-circle" size={18} color={GameColors.coinGold} />
          <ThemedText style={styles.walletButtonText}>Add Money</ThemedText>
        </Pressable>

        <View style={styles.walletDivider} />

        <Pressable
          style={styles.walletButton}
          onPress={() => navigation.navigate("History")}
        >
          <Feather name="clock" size={18} color={Colors.dark.textSecondary} />
          <ThemedText style={styles.walletButtonText}>History</ThemedText>
        </Pressable>

        <View style={styles.walletDivider} />

        <Pressable
          style={styles.walletButton}
          onPress={() => navigation.navigate("Leaderboard")}
        >
          <Feather name="award" size={18} color={GameColors.yellow} />
          <ThemedText style={styles.walletButtonText}>Rank</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.roundInfo}>
          <ThemedText style={styles.roundLabel}>
            Round #{gameState.currentRound}
          </ThemedText>
        </View>

        <View style={styles.trafficLightsSection}>
          <View style={styles.trafficLightsRow}>
            {COLORS.map((color) => (
              <TrafficLight
                key={color}
                color={color}
                isActive={gameState.phase === "result"}
                isSelected={selectedColor === color}
                isResult={
                  gameState.phase === "result" && gameState.lastResult === color
                }
                onPress={() => handleColorSelect(color)}
                disabled={gameState.phase !== "betting" || betPlaced}
                size={75}
              />
            ))}
          </View>
        </View>

        <View style={styles.timerSection}>
          <CountdownTimer
            countdown={gameState.countdown}
            phase={gameState.phase}
          />
          {betPlaced && gameState.phase === "betting" && (
            <View style={styles.betPlacedBadge}>
              <Feather name="check-circle" size={16} color={GameColors.green} />
              <ThemedText style={styles.betPlacedText}>
                Bet placed on {selectedColor?.toUpperCase()}!
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.bettingSection}>
          <BetControls
            currentBet={betAmount}
            maxBet={user?.balance ?? 0}
            onAdjust={adjustBet}
            disabled={gameState.phase !== "betting" || betPlaced}
          />

          <View style={styles.betButtonsRow}>
            {COLORS.map((color) => (
              <ColorBetButton
                key={color}
                color={color}
                isSelected={selectedColor === color}
                onPress={() => handleColorSelect(color)}
                disabled={
                  gameState.phase !== "betting" ||
                  betPlaced ||
                  betAmount > (user?.balance ?? 0)
                }
              />
            ))}
          </View>

          {!betPlaced && selectedColor && gameState.phase === "betting" && (
            <Pressable
              style={[
                styles.placeBetButton,
                isBetting && styles.placeBetButtonDisabled,
              ]}
              onPress={handlePlaceBet}
              disabled={isBetting}
            >
              {isBetting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <ThemedText style={styles.placeBetButtonText}>
                  Place Bet - {betAmount} coins on {selectedColor.toUpperCase()}
                </ThemedText>
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.historySection}>
          <ThemedText style={styles.historySectionTitle}>
            Result History
          </ThemedText>
          <View style={styles.tableHeader}>
            <ThemedText style={[styles.tableHeaderText, { flex: 1 }]}>Color</ThemedText>
            <ThemedText style={[styles.tableHeaderText, { flex: 1 }]}>No.</ThemedText>
            <ThemedText style={[styles.tableHeaderText, { flex: 2 }]}>Date Time</ThemedText>
          </View>
          {gameState.history.slice(0, 10).map((round) => (
            <View key={round.id} style={styles.tableRow}>
              <View style={[styles.colorCell, { backgroundColor: getColorForResult(round.resultColor) }]}>
                <ThemedText style={styles.colorCellText}>
                  {round.resultColor.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={[styles.tableCellText, { flex: 1 }]}>
                {Math.floor(Math.random() * 10)}
              </ThemedText>
              <ThemedText style={[styles.tableCellText, { flex: 2 }]}>
                {new Date(round.timestamp).toLocaleDateString()} {new Date(round.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            </View>
          ))}
          {gameState.history.length === 0 && (
            <ThemedText style={styles.noHistoryText}>
              No rounds played yet
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  menuButton: {
    padding: Spacing.sm,
  },
  logo: {
    width: 100,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  walletBar: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundDefault,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "space-around",
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  walletButtonText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  walletDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  roundInfo: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  roundLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "600",
  },
  trafficLightsSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  trafficLightsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing["3xl"],
  },
  timerSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  betPlacedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  betPlacedText: {
    fontSize: 14,
    color: GameColors.green,
    fontWeight: "600",
  },
  bettingSection: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  betButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  placeBetButton: {
    backgroundColor: GameColors.green,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  placeBetButtonDisabled: {
    opacity: 0.6,
  },
  placeBetButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  historySection: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  historySectionTitle: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: Spacing.md,
    fontWeight: "700",
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  tableCellText: {
    fontSize: 12,
    color: "#FFF",
    textAlign: "center",
  },
  colorCell: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "auto",
  },
  colorCellText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  historyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  historyDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  noHistoryText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
});
