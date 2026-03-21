import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import * as Haptics from "expo-haptics";

interface AdminUser {
  id: number;
  username: string;
  phone: string;
  balance: number;
  isAdmin: boolean;
  createdAt: string;
}

export function useAdmin() {
  const queryClient = useQueryClient();

  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 10000,
  });

  const setResultMutation = useMutation({
    mutationFn: async (color: string) => {
      const res = await apiRequest("POST", "/api/admin/set-result", { color });
      return res.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const addBalanceMutation = useMutation({
    mutationFn: async (data: { userId: number; amount: number }) => {
      const res = await apiRequest("POST", "/api/admin/add-balance", data);
      return res.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const setNextResult = async (color: string) => {
    return setResultMutation.mutateAsync(color);
  };

  const addUserBalance = async (userId: number, amount: number) => {
    return addBalanceMutation.mutateAsync({ userId, amount });
  };

  return {
    users: users ?? [],
    isLoadingUsers,
    refetchUsers,
    setNextResult,
    isSettingResult: setResultMutation.isPending,
    addUserBalance,
    isAddingBalance: addBalanceMutation.isPending,
  };
}
