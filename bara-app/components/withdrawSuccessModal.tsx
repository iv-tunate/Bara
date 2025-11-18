"use client";
import Link from "next/link";
import Image from "next/image";

interface WithdrawSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawSuccessModal({
  isOpen,
  onClose,
}: WithdrawSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-4xl rounded-md p-16 py-35 flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/withdraw-succ.svg"
            alt="Success"
            width={80}
            height={80}
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Payout successful!
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-10">
          ₦250,000 has been sent to your bank account
        </p>

        {/* Buttons */}
        <div className="w-full max-w-md flex flex-col gap-4">
          {/* View Wallet */}

          <button
            onClick={onClose}
            className="w-full bg-red-900 hover:bg-red-800 text-white py-3 rounded-sm text-md transition"
          >
            View Bara wallet
          </button>

          {/* Go Home */}
          <Link href="/" className="w-full">
            <button className="w-full border border-red-900 text-red-900 py-3 rounded-sm text-md flex items-center justify-center gap-3 hover:bg-red-50 transition">
              <Image src="/Home.svg" alt="Home" width={20} height={20} />
              Go home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
