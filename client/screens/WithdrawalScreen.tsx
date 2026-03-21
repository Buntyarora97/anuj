import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { Colors, Spacing, BorderRadius, GameColors } from "@/constants/theme";

export default function WithdrawalScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { user, refreshUser } = useAuth();
  const { withdraw, isWithdrawing } = useWallet();

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleWithdraw = async () => {
    setError("");
    setSuccess("");

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount < 500) {
      setError("Minimum withdrawal is ₹500");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (numAmount > (user?.balance ?? 0)) {
      setError("Insufficient balance");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!bankName || !ifscCode || !accountNumber || !accountHolderName) {
      setError("Please fill all bank details");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      setError("Account numbers do not match");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await withdraw({
        amount: numAmount,
        bankName,
        ifscCode,
        accountNumber,
        accountHolderName,
      });
      await refreshUser();
      setSuccess("Withdrawal request submitted!");
      setAmount("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e.message || "Withdrawal failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
    >
      <View style={styles.balanceCard}>
        <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
        <ThemedText style={styles.balanceAmount}>₹{user?.balance ?? 0}</ThemedText>
      </View>

      <View style={styles.form}>
        <ThemedText style={styles.sectionTitle}>Withdrawal Amount</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter amount (Min ₹500)"
          placeholderTextColor={Colors.dark.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
        />

        <ThemedText style={styles.sectionTitle}>Bank Details</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Bank Name"
          placeholderTextColor={Colors.dark.textMuted}
          value={bankName}
          onChangeText={setBankName}
        />
        <TextInput
          style={styles.input}
          placeholder="IFSC Code"
          placeholderTextColor={Colors.dark.textMuted}
          value={ifscCode}
          onChangeText={setIfscCode}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="Account Holder Name"
          placeholderTextColor={Colors.dark.textMuted}
          value={accountHolderName}
          onChangeText={setAccountHolderName}
        />
        <TextInput
          style={styles.input}
          placeholder="Account Number"
          placeholderTextColor={Colors.dark.textMuted}
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="number-pad"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Account Number"
          placeholderTextColor={Colors.dark.textMuted}
          value={confirmAccountNumber}
          onChangeText={setConfirmAccountNumber}
          keyboardType="number-pad"
        />

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
        {success ? <ThemedText style={styles.successText}>{success}</ThemedText> : null}

        <Button
          onPress={handleWithdraw}
          disabled={isWithdrawing}
          style={styles.withdrawButton}
        >
          {isWithdrawing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            "Request Withdrawal"
          )}
        </Button>
      </View>
    </ScrollView>
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
    marginBottom: Spacing.xl,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: GameColors.coinGold,
  },
  form: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.sm,
    color: Colors.dark.textSecondary,
  },
  input: {
    height: 56,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSecondary,
  },
  withdrawButton: {
    marginTop: Spacing.lg,
    backgroundColor: GameColors.green,
  },
  errorText: {
    color: GameColors.red,
    textAlign: "center",
  },
  successText: {
    color: GameColors.green,
    textAlign: "center",
  },
});
