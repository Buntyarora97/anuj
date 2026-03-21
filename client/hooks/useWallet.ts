import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import * as Haptics from "expo-haptics";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  paymentId: string | null;
  createdAt: string;
}

interface AddMoneyResponse {
  transaction: Transaction;
  balance: number;
  message: string;
}

export function useWallet() {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/wallet/transactions"],
    staleTime: 10000,
  });

  const addMoneyMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/wallet/add", { amount });
      return res.json() as Promise<AddMoneyResponse>;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { 
      amount: number; 
      bankName: string; 
      ifscCode: string; 
      accountNumber: string; 
      accountHolderName: string; 
    }) => {
      const res = await apiRequest("POST", "/api/wallet/withdraw", data);
      return res.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const addMoney = async (amount: number) => {
    return addMoneyMutation.mutateAsync(amount);
  };

  const withdraw = async (data: { 
    amount: number; 
    bankName: string; 
    ifscCode: string; 
    accountNumber: string; 
    accountHolderName: string; 
  }) => {
    return withdrawMutation.mutateAsync(data);
  };

  return {
    transactions: transactions ?? [],
    isLoadingTransactions,
    addMoney,
    withdraw,
    isAddingMoney: addMoneyMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    addMoneyError: addMoneyMutation.error,
    withdrawError: withdrawMutation.error,
  };
}
