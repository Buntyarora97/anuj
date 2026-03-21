import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius, GameColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { register, isRegistering } = useAuth();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCodeUsed, setReferralCodeUsed] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!username || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setError("");
      await register(username, phone, password, referralCodeUsed);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e.message || "Registration failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoSection}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.title}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>
            Join the game and start winning!
          </ThemedText>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Username</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              placeholderTextColor={Colors.dark.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              testID="input-username"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor={Colors.dark.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              testID="input-register-phone"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Create password"
              placeholderTextColor={Colors.dark.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="input-register-password"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Confirm Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={Colors.dark.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              testID="input-confirm-password"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Referral Code (Optional)</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter referral code"
              placeholderTextColor={Colors.dark.textMuted}
              value={referralCodeUsed}
              onChangeText={setReferralCodeUsed}
              autoCapitalize="characters"
              testID="input-referral-code"
            />
          </View>

          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : null}

          <Button
            onPress={handleRegister}
            disabled={isRegistering}
            style={styles.registerButton}
          >
            {isRegistering ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              "Register"
            )}
          </Button>

          <View style={styles.loginSection}>
            <ThemedText style={styles.loginText}>
              Already have an account?
            </ThemedText>
            <Pressable onPress={() => navigation.goBack()}>
              <ThemedText style={styles.loginLink}>Login</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  formSection: {
    gap: Spacing.md,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  input: {
    height: Spacing.inputHeight,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSecondary,
  },
  errorText: {
    color: GameColors.red,
    fontSize: 14,
    textAlign: "center",
  },
  registerButton: {
    marginTop: Spacing.lg,
    backgroundColor: GameColors.green,
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  loginText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: GameColors.yellow,
    fontSize: 14,
    fontWeight: "600",
  },
});
