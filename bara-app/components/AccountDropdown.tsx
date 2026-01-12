"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { clearUserSession } from "@/utils/tokenManager";

export interface UserData {
  userId: string;
  name: string;
  email: string;
  userType: string;
  verificationStatus: string;
  isVerified: boolean;
  profileImageUrl?: string;
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

  const verificationStatusConfig: Record<
    string,
    { label: string; className: string }
  > = {
    Pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    Approved: {
      label: "Approved",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    Rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    Failed: {
      label: "Failed",
      className: "bg-orange-100 text-orange-800 border-orange-200",
    },
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
      className="w-80 bg-white shadow-2xl rounded-xl border border-gray-100 z-50 overflow-hidden"
    >
      {/* Header with gradient */}
      <div className="p-5 bg-linear-to-br from-[#800000] to-[#a00000] text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-base mb-1">
                {userData?.name ?? "Anonymous"}
              </h3>
              <p className="text-xs text-white/90 truncate">
                {userData?.email}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/90">Verification:</span>

              <span
                className={`
        px-2 py-0.5 rounded-full text-xs font-semibold border
        ${
          verificationStatusConfig[userData?.verificationStatus as string]
            ?.className ?? "bg-gray-100 text-gray-700 border-gray-200"
        }
      `}
              >
                {verificationStatusConfig[
                  userData?.verificationStatus as string
                ]?.label ?? "Unknown"}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden relative">
              {userData?.profileImageUrl ? (
                <Image
                  src={userData.profileImageUrl}
                  alt={userData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <svg
                  className="w-6 h-6 text-white"
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
              )}
            </div>
          </div>
        </div>
      </div>

      {walletData && (
        <div className="p-4 bg-linear-to-br from-gray-50 to-white border-b border-gray-100">
          <h4 className="font-semibold text-[#22242A] text-sm mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#800000]"
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
            </svg>
            Wallet Balance
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
              <span className="text-gray-600 font-medium">Total:</span>
              <span className="font-bold text-[#800000]">
                {formatCurrency(
                  walletData.totalBalance,
                  walletData.currencySymbol
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
              <span className="text-gray-600 font-medium">Available:</span>
              <span className="font-semibold text-green-700">
                {formatCurrency(
                  walletData.availableBalance,
                  walletData.currencySymbol
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
              <span className="text-gray-600 font-medium">Locked:</span>
              <span className="font-semibold text-orange-700">
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
        {(userData?.userType === "Writer" ||
          userData?.userType === "Producer") && (
          <Link
            href={
              userData?.userType === "Writer"
                ? "/writer/profile"
                : "/producer/profile"
            }
            onClick={onClose}
            className="flex items-center px-4 py-3 text-sm text-[#333740] hover:bg-linear-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group"
          >
            <svg
              className="w-5 h-5 mr-3 text-gray-600 group-hover:text-[#800000] transition-colors"
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
            <span className="font-medium">My Profile</span>
          </Link>
        )}

        <Link
          href="/wallet"
          onClick={onClose}
          className="flex items-center px-4 py-3 text-sm text-[#333740] hover:bg-linear-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group"
        >
          <svg
            className="w-5 h-5 mr-3 text-gray-600 group-hover:text-[#800000] transition-colors"
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
          <span className="font-medium">My Wallet</span>
        </Link>

        <Link
          href="/help"
          onClick={onClose}
          className="flex items-center px-4 py-3 text-sm text-[#333740] hover:bg-linear-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group"
        >
          <svg
            className="w-5 h-5 mr-3 text-gray-600 group-hover:text-[#800000] transition-colors"
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
          <span className="font-medium">Help and Support</span>
        </Link>

        <Link
          href="/terms"
          onClick={onClose}
          className="flex items-center px-4 py-3 text-sm text-[#333740] hover:bg-linear-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group"
        >
          <svg
            className="w-5 h-5 mr-3 text-gray-600 group-hover:text-[#800000] transition-colors"
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
          <span className="font-medium">Terms & Conditions</span>
        </Link>

        <hr className="my-2 border-gray-200" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
        >
          <svg
            className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform"
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
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
}
