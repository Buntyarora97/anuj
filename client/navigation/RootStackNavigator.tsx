import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { HeaderButton } from "@react-navigation/elements";

import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import GameScreen from "@/screens/GameScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import WalletScreen from "@/screens/WalletScreen";
import WithdrawalScreen from "@/screens/WithdrawalScreen";
import AdminScreen from "@/screens/AdminScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing } from "@/constants/theme";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Game: undefined;
  History: undefined;
  Leaderboard: undefined;
  Settings: undefined;
  Wallet: undefined;
  Withdrawal: undefined;
  Admin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.dark.backgroundRoot }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{
              headerTitle: "Bet History",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{
              headerTitle: "Leaderboard",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={({ navigation }) => ({
              headerTitle: "Profile",
              presentation: "modal",
              headerLeft: () => null,
              headerRight: () => (
                <HeaderButton
                  onPress={() => navigation.goBack()}
                  pressColor={Colors.dark.backgroundSecondary}
                  style={{ marginRight: -Spacing.sm }}
                >
                  <Feather name="x" size={24} color={Colors.dark.text} />
                </HeaderButton>
              ),
            })}
          />
          <Stack.Screen
            name="Wallet"
            component={WalletScreen}
            options={{
              headerTitle: "Wallet",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Withdrawal"
            component={WithdrawalScreen}
            options={{
              headerTitle: "Withdraw Money",
              presentation: "modal",
            }}
          />
          {isAdmin && (
            <Stack.Screen
              name="Admin"
              component={AdminScreen}
              options={{
                headerTitle: "Admin Panel",
                presentation: "modal",
              }}
            />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}
