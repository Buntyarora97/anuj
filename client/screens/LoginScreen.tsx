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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoggingIn, loginError } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!phone || !password) {
      setError("Please fill in all fields");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setError("");
      await login(phone, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e.message || "Login failed");
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
          <ThemedText style={styles.title}>3 Batti Game</ThemedText>
          <ThemedText style={styles.subtitle}>
            Bet on Traffic Lights & Win Big!
          </ThemedText>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor={Colors.dark.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              testID="input-phone"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={Colors.dark.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="input-password"
            />
          </View>

          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : null}

          <Button
            onPress={handleLogin}
            disabled={isLoggingIn}
            style={styles.loginButton}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              "Login"
            )}
          </Button>

          <View style={styles.registerSection}>
            <ThemedText style={styles.registerText}>
              Don't have an account?
            </ThemedText>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <ThemedText style={styles.registerLink}>Register Now</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.adminHint}>
          <ThemedText style={styles.hintText}>
            Admin Login: 9999999999 / admin123
          </ThemedText>
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
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  formSection: {
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.sm,
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
  loginButton: {
    marginTop: Spacing.lg,
    backgroundColor: GameColors.green,
  },
  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  registerText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: GameColors.yellow,
    fontSize: 14,
    fontWeight: "600",
  },
  adminHint: {
    marginTop: "auto",
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
  },
  hintText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: "center",
  },
});
