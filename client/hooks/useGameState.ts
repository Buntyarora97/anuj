import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import * as Haptics from "expo-haptics";

interface GameRoundHistory {
  id: number;
  roundNumber: number;
  resultColor: string;
  createdAt: string;
}

interface GameState {
  currentRound: number;
  phase: "betting" | "result";
  countdown: number;
  lastResult: string | null;
  history: GameRoundHistory[];
}

interface BetResponse {
  bet: any;
  balance: number;
}

export function useGameState() {
  const queryClient = useQueryClient();

  const { data: gameState, isLoading } = useQuery<GameState>({
    queryKey: ["/api/game/state"],
    refetchInterval: 1000,
    staleTime: 500,
  });

  const placeBetMutation = useMutation({
    mutationFn: async (data: { betColor: string; betAmount: number }) => {
      const res = await apiRequest("POST", "/api/game/bet", data);
      return res.json() as Promise<BetResponse>;
    },
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/bets"] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const placeBet = async (betColor: string, betAmount: number) => {
    return placeBetMutation.mutateAsync({ betColor, betAmount });
  };

  return {
    gameState: gameState ?? null,
    isLoading,
    placeBet,
    isBetting: placeBetMutation.isPending,
    betError: placeBetMutation.error,
  };
}

export function useUserBets() {
  const { data: bets, isLoading } = useQuery<any[]>({
    queryKey: ["/api/user/bets"],
    staleTime: 5000,
  });

  return {
    bets: bets ?? [],
    isLoading,
  };
}

export function useLeaderboard() {
  const { data: leaderboard, isLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard"],
    staleTime: 30000,
  });

  return {
    leaderboard: leaderboard ?? [],
    isLoading,
  };
}
