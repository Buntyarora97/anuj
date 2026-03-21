import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, getApiUrl } from "@/lib/query-client";

interface User {
  id: number;
  username: string;
  phone: string;
  balance: number;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { phone: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; phone: string; password: string; referralCodeUsed?: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
    },
  });

  const login = useCallback(
    async (phone: string, password: string) => {
      return loginMutation.mutateAsync({ phone, password });
    },
    [loginMutation]
  );

  const register = useCallback(
    async (username: string, phone: string, password: string, referralCodeUsed?: string) => {
      return registerMutation.mutateAsync({ username, phone, password, referralCodeUsed });
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refreshUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
    login,
    register,
    logout,
    refreshUser,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
