import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { CoinDisplay } from "@/components/CoinDisplay";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { Colors, Spacing, BorderRadius, GameColors } from "@/constants/theme";

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { user, refreshUser } = useAuth();
  const { transactions, addMoney, isAddingMoney } = useWallet();

  const [amount, setAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddMoney = async () => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await addMoney(numAmount);
      await refreshUser();
      setAmount("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      console.error("Add money error:", e);
    }
  };

  const handleQuickAmount = (amt: number) => {
    Haptics.selectionAsync();
    setAmount(amt.toString());
  };

  const renderTransaction = ({ item }: { item: any }) => {
    const isDeposit = item.type === "deposit" || item.type === "admin_credit";
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <Feather
            name={isDeposit ? "arrow-down-circle" : "arrow-up-circle"}
            size={24}
            color={isDeposit ? GameColors.green : GameColors.red}
          />
        </View>
        <View style={styles.transactionDetails}>
          <ThemedText style={styles.transactionType}>
            {item.type === "deposit"
              ? "Money Added"
              : item.type === "admin_credit"
                ? "Admin Credit"
                : item.type}
          </ThemedText>
          <ThemedText style={styles.transactionDate}>
            {formatDate(item.createdAt)}
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.transactionAmount,
            { color: isDeposit ? GameColors.green : GameColors.red },
          ]}
        >
          {isDeposit ? "+" : "-"}{item.amount}
        </ThemedText>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: headerHeight + Spacing.lg },
      ]}
    >
      <View style={styles.balanceCard}>
        <ThemedText style={styles.balanceLabel}>Your Balance</ThemedText>
        <CoinDisplay balance={user?.balance ?? 0} />
      </View>

      {showSuccess && (
        <View style={styles.successBanner}>
          <Feather name="check-circle" size={20} color={GameColors.green} />
          <ThemedText style={styles.successText}>
            Money added successfully!
          </ThemedText>
        </View>
      )}

      <View style={styles.addMoneySection}>
        <ThemedText style={styles.sectionTitle}>Add Money (Demo)</ThemedText>

        <View style={styles.amountInputContainer}>
          <ThemedText style={styles.currencySymbol}>₹</ThemedText>
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount"
            placeholderTextColor={Colors.dark.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            testID="input-amount"
          />
        </View>

        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((amt) => (
            <Pressable
              key={amt}
              style={[
                styles.quickAmountButton,
                amount === amt.toString() && styles.quickAmountButtonActive,
              ]}
              onPress={() => handleQuickAmount(amt)}
            >
              <ThemedText
                style={[
                  styles.quickAmountText,
                  amount === amt.toString() && styles.quickAmountTextActive,
                ]}
              >
                ₹{amt}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Button
          onPress={handleAddMoney}
          disabled={isAddingMoney || !amount || parseInt(amount) < 100}
          style={styles.addButton}
        >
          {isAddingMoney ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            "Add Money"
          )}
        </Button>

        <ThemedText style={styles.demoNote}>
          This is a demo wallet. No real payment is processed.
        </ThemedText>
      </View>

      <View style={styles.transactionsSection}>
        <ThemedText style={styles.sectionTitle}>Transaction History</ThemedText>
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.transactionsList,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          ListEmptyComponent={
            <EmptyState
              image={require("../../assets/images/coin-stack.png")}
              title="No transactions yet"
              subtitle="Add money to get started"
            />
          }
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
  balanceCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
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
  addMoneySection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: GameColors.coinGold,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    height: 56,
    fontSize: 24,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  quickAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickAmountButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSecondary,
  },
  quickAmountButtonActive: {
    backgroundColor: GameColors.green,
    borderColor: GameColors.green,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  quickAmountTextActive: {
    color: "#FFFFFF",
  },
  addButton: {
    backgroundColor: GameColors.green,
  },
  demoNote: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  transactionsSection: {
    flex: 1,
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  transactionIcon: {
    marginRight: Spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
