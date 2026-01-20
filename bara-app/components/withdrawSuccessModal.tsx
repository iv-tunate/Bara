"use client";
import Link from "next/link";
import Image from "next/image";

interface WithdrawSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  accountName?: string;
}

export default function WithdrawSuccessModal({
  isOpen,
  onClose,
  amount = 0,
  accountName = "",
}: WithdrawSuccessModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-2xl rounded-md p-16 py-20 flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/withdraw-succ.svg"
            alt="Success"
            width={60}
            height={60}
          />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-[#333740] mb-2">
          Withdrawal initiated!
        </h2>

        {/* Subtitle */}
        <p className="text-[#333740] mb-2 text-sm">
          {formatCurrency(amount)} is being processed
        </p>

        {accountName && (
          <p className="text-gray-500 text-xs mb-4">to {accountName}</p>
        )}

        <p className="text-gray-500 text-xs mb-6">
          Your withdrawal is being processed. You will receive a confirmation
          email once the transfer is complete.
        </p>

        {/* Buttons */}
        <div className="w-full max-w-md flex flex-col gap-4">
          {/* View Wallet */}
          <button
            onClick={onClose}
            className="w-full bg-red-900 hover:bg-red-800 text-white py-3 rounded-sm text-md transition cursor-pointer flex items-center justify-center gap-3"
          >
            View Bara wallet
          </button>

          {/* Go Home */}
          <Link href="/dashboard" className="w-full">
            <button className="w-full border border-red-900 text-red-900 py-3 rounded-sm text-md flex items-center justify-center gap-3 hover:bg-red-50 transition cursor-pointer">
              <Image src="/Home.svg" alt="Home" width={20} height={20} />
              Go to dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
