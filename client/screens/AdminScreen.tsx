import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { TrafficLight } from "@/components/TrafficLight";
import { Button } from "@/components/Button";
import { useAdmin } from "@/hooks/useAdmin";
import { useGameState } from "@/hooks/useGameState";
import { Colors, Spacing, BorderRadius, GameColors } from "@/constants/theme";

const COLORS = ["red", "yellow", "green"] as const;

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { users, setNextResult, isSettingResult, addUserBalance, isAddingBalance, refetchUsers } = useAdmin();
  const { gameState } = useGameState();

  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSetResult = async () => {
    if (!selectedResult) return;
    try {
      await setNextResult(selectedResult);
      setSuccessMessage(`Next result set to ${selectedResult.toUpperCase()}`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setSelectedResult(null);
    } catch (e) {
      console.error("Set result error:", e);
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser || !addAmount) return;
    const amount = parseInt(addAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await addUserBalance(selectedUser, amount);
      setSuccessMessage(`Added ${amount} coins to user`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setAddAmount("");
      setSelectedUser(null);
    } catch (e) {
      console.error("Add balance error:", e);
    }
  };

  const renderUser = ({ item }: { item: any }) => (
    <Pressable
      style={[
        styles.userItem,
        selectedUser === item.id && styles.userItemSelected,
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        setSelectedUser(selectedUser === item.id ? null : item.id);
      }}
    >
      <View style={styles.userInfo}>
        <ThemedText style={styles.userName}>{item.username}</ThemedText>
        <ThemedText style={styles.userPhone}>{item.phone}</ThemedText>
      </View>
      <View style={styles.userBalance}>
        <ThemedText style={[styles.userBalanceText, { color: GameColors.coinGold }]}>
          {item.balance.toLocaleString()}
        </ThemedText>
        <ThemedText style={styles.userBalanceLabel}>coins</ThemedText>
      </View>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: headerHeight + Spacing.lg },
      ]}
    >
      {successMessage ? (
        <View style={styles.successBanner}>
          <Feather name="check-circle" size={20} color={GameColors.green} />
          <ThemedText style={styles.successText}>{successMessage}</ThemedText>
        </View>
      ) : null}

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Game Control</ThemedText>
        <View style={styles.gameInfoCard}>
          <View style={styles.gameInfoRow}>
            <ThemedText style={styles.gameInfoLabel}>Current Round:</ThemedText>
            <ThemedText style={styles.gameInfoValue}>
              #{gameState?.currentRound ?? "-"}
            </ThemedText>
          </View>
          <View style={styles.gameInfoRow}>
            <ThemedText style={styles.gameInfoLabel}>Phase:</ThemedText>
            <ThemedText
              style={[
                styles.gameInfoValue,
                {
                  color:
                    gameState?.phase === "betting"
                      ? GameColors.green
                      : GameColors.yellow,
                },
              ]}
            >
              {gameState?.phase?.toUpperCase() ?? "-"}
            </ThemedText>
          </View>
          <View style={styles.gameInfoRow}>
            <ThemedText style={styles.gameInfoLabel}>Countdown:</ThemedText>
            <ThemedText style={styles.gameInfoValue}>
              {gameState?.countdown ?? 0}s
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Set Next Result</ThemedText>
        <View style={styles.resultButtons}>
          {COLORS.map((color) => (
            <TrafficLight
              key={color}
              color={color}
              isActive={false}
              isSelected={selectedResult === color}
              isResult={false}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSelectedResult(selectedResult === color ? null : color);
              }}
              size={60}
            />
          ))}
        </View>
        <Button
          onPress={handleSetResult}
          disabled={!selectedResult || isSettingResult}
          style={styles.setResultButton}
        >
          {isSettingResult ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            `Set Result: ${selectedResult?.toUpperCase() ?? "Select Color"}`
          )}
        </Button>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Users ({users.length})</ThemedText>
          <Pressable onPress={() => refetchUsers()} style={styles.refreshButton}>
            <Feather name="refresh-cw" size={18} color={Colors.dark.textSecondary} />
          </Pressable>
        </View>

        {selectedUser && (
          <View style={styles.addBalanceCard}>
            <ThemedText style={styles.addBalanceLabel}>
              Add coins to selected user:
            </ThemedText>
            <View style={styles.addBalanceRow}>
              <TextInput
                style={styles.addBalanceInput}
                placeholder="Amount"
                placeholderTextColor={Colors.dark.textMuted}
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="number-pad"
              />
              <Button
                onPress={handleAddBalance}
                disabled={!addAmount || isAddingBalance}
                style={styles.addBalanceButton}
              >
                {isAddingBalance ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  "Add"
                )}
              </Button>
            </View>
          </View>
        )}

        <FlatList
          data={users.filter((u: any) => u.phone !== "9999999999")}
          renderItem={renderUser}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.usersList,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
    paddingHorizontal: Spacing.lg,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  successText: {
    color: GameColors.green,
    fontWeight: "600",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  refreshButton: {
    padding: Spacing.sm,
  },
  gameInfoCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  gameInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gameInfoLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  gameInfoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing["3xl"],
    marginBottom: Spacing.lg,
  },
  setResultButton: {
    backgroundColor: GameColors.yellow,
  },
  addBalanceCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addBalanceLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  addBalanceRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  addBalanceInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.dark.text,
  },
  addBalanceButton: {
    paddingHorizontal: Spacing.xl,
  },
  usersList: {
    gap: Spacing.sm,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  userItemSelected: {
    borderWidth: 2,
    borderColor: GameColors.green,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
  },
  userPhone: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  userBalance: {
    alignItems: "flex-end",
  },
  userBalanceText: {
    fontSize: 16,
    fontWeight: "700",
  },
  userBalanceLabel: {
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
});
