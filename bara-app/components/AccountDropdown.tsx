"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserSession, clearUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";

interface Props {
  onClose: () => void;
}

interface UserData {
  userId: string;
  name: string;
  email: string;
  userType: string;
  verificationStatus: string;
  isVerified: boolean;
}

interface WalletData {
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  currencySymbol: string;
}

export default function AccountDropdown({ onClose }: Props) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const session = getUserSession();
        if (session) {
          let profileResponse;
          if (session.userType === "Writer") {
            profileResponse = await api.getWriterProfile(session.userId);
          } else if (session.userType === "Producer") {
            profileResponse = await api.getProducerProfile(session.userId);
          }

          setUserData({
            userId: session.userId,
            name: session.name,
            email: session.email,
            userType: session.userType,
            verificationStatus:
              profileResponse?.success && profileResponse.data
                ? profileResponse.data.verificationStatus || "Pending"
                : "Pending",
            isVerified:
              profileResponse?.success && profileResponse.data
                ? profileResponse.data.isVerified || false
                : false,
          });

          const walletResponse = await api.getWalletBalance(session.userId);
          if (walletResponse.success && walletResponse.data) {
            setWalletData({
              totalBalance: walletResponse.data.totalBalance || 0,
              availableBalance: walletResponse.data.availableBalance || 0,
              lockedBalance: walletResponse.data.lockedBalance || 0,
              currencySymbol: walletResponse.data.currencySymbol || "₦",
            });
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    clearUserSession();
    onClose();
    router.push("/auth/login");
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
      case "inprogress":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
      case "approved":
        return "Verified";
      case "pending":
        return "Pending";
      case "inprogress":
        return "In Progress";
      case "failed":
      case "rejected":
        return "Failed";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, symbol: string) => {
    return `${symbol}${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div
        ref={dropdownRef}
        className="w-80 bg-white shadow-lg rounded-md border border-gray-200 p-4 z-50"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="w-80 bg-white shadow-lg rounded-md border border-gray-200 z-50 overflow-hidden"
    >
      {/* User Info Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#22242A] text-sm">
              {userData?.name}
            </h3>
            <p className="text-xs text-[#666] truncate">{userData?.email}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(
              userData?.verificationStatus || "Pending"
            )}`}
          >
            {getVerificationStatusDisplay(
              userData?.verificationStatus || "Pending"
            )}
          </span>
        </div>
      </div>

      {/* Wallet Section */}
      {walletData && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-[#22242A] text-sm mb-2">Wallet</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#666]">Total:</span>
              <span className="font-medium">
                {formatCurrency(
                  walletData.totalBalance,
                  walletData.currencySymbol
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">Available:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(
                  walletData.availableBalance,
                  walletData.currencySymbol
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">Locked:</span>
              <span className="font-medium text-orange-600">
                {formatCurrency(
                  walletData.lockedBalance,
                  walletData.currencySymbol
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="py-2">
        {/* Profile Link - Only for Writers */}
        {userData?.userType === "Writer" && (
          <Link
            href={`/writer/profile/${userData.userId}`}
            onClick={onClose}
            className="flex items-center px-4 py-2 text-sm text-[#22242A] hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </Link>
        )}

        {/* Transactions */}
        <Link
          href="/transactions"
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm text-[#22242A] hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Transactions
        </Link>

        {/* Scripts - Only for Writers */}
        {userData?.userType === "Writer" && (
          <Link
            href="/writer/scripts"
            onClick={onClose}
            className="flex items-center px-4 py-2 text-sm text-[#22242A] hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            My Scripts
          </Link>
        )}

        {/* Bank Details */}
        <Link
          href="/bank-details"
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm text-[#22242A] hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          Bank Details
        </Link>

        <hr className="my-2 border-gray-200" />

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
