"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearUserSession } from "@/utils/tokenManager";

interface Props {
  onClose: () => void;
}

export interface UserData {
  userId: string;
  name: string;
  email: string;
  userType: string;
  verificationStatus: string;
  isVerified: boolean;
}

export interface WalletData {
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  currencySymbol: string;
}

interface Props {
  onClose: () => void;
  userData: UserData | null;
  walletData: WalletData | undefined;
  isLoading: boolean;
}

export default function AccountDropdown({
  onClose,
  userData,
  walletData,
  isLoading,
}: Props) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleLogout = () => {
    clearUserSession();
    onClose();
    router.push("/auth/login");
  };

  const formatCurrency = (amount: number, symbol = "₦") =>
    `${symbol}${Number(amount).toLocaleString()}`;

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
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#22242A] text-sm">
              {userData?.name ?? "Anonymous"}
            </h3>
            <p className="text-xs text-[#666] truncate">{userData?.email}</p>
          </div>
        </div>
      </div>

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

      <div className="py-2">
        {userData?.userType === "Writer" && (
          <Link
            href={`/writer/profile`}
            onClick={onClose}
            className="flex items-center px-4 py-2 text-sm text-[#333740] hover:bg-[#F5F5F5] transition-colors"
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
            My Profile
          </Link>
        )}

        {/* <Link
          href="/account/id"
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm text-[#333740] hover:bg-[#F5F5F5] transition-colors"
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
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.487 0 4.807.63 6.879 1.804M12 11a3 3 0 100-6 3 3 0 000 6z"
            />
          </svg>
          My Account
        </Link> */}

        <Link
          href="/wallet"
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm text-[#333740] hover:bg-[#F5F5F5] transition-colors"
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
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
          My Wallet
        </Link>
        
        <Link
          href="/help"
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm text-[#333740] hover:bg-[#F5F5F5] transition-colors"
        >
  <svg
  className="w-5 h-5 mr-2"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M12 18h.01M12 6a6 6 0 00-6 6c0 2.5 3 2.5 3 5h6c0-2.5 3-2.5 3-5a6 6 0 00-6-6z"
  />
</svg>


          Help and Support
        </Link>

        <hr className="my-2 border-gray-200" />

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
