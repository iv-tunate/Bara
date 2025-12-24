"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";
import { useSignalR } from "./SignalRContext";

export interface WalletData {
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  currencySymbol: string;
}

interface WalletContextType {
  walletData: WalletData | null;
  isLoading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  walletData: null,
  isLoading: true,
  error: null,
  refreshWallet: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { connection, isConnected } = useSignalR();

  const fetchWalletData = useCallback(async () => {
    try {
      const session = getUserSession();
      if (!session?.userId) {
        setIsLoading(false);
        return;
      }

      const response = await api.getWalletBalance(session.userId);
      if (response?.success && response?.data) {
        setWalletData({
          totalBalance: response.data.totalBalance ?? 0,
          availableBalance: response.data.availableBalance ?? 0,
          lockedBalance: response.data.lockedBalance ?? 0,
          currencySymbol: response.data.currencySymbol ?? "₦",
        });
        setError(null);
      } else {
        setError("Failed to load wallet data");
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError("An error occurred while loading wallet data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Listen for wallet updates via SignalR
  useEffect(() => {
    if (!connection || !isConnected) return;

    const handleWalletUpdate = (data: { Balance: number; Total: number }) => {
      console.log("Wallet updated via SignalR:", data);
      // Refresh wallet data when SignalR notifies us
      fetchWalletData();
    };

    connection.on("WalletUpdated", handleWalletUpdate);

    return () => {
      connection.off("WalletUpdated", handleWalletUpdate);
    };
  }, [connection, isConnected, fetchWalletData]);

  const refreshWallet = useCallback(async () => {
    setIsLoading(true);
    await fetchWalletData();
  }, [fetchWalletData]);

  return (
    <WalletContext.Provider
      value={{ walletData, isLoading, error, refreshWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};
