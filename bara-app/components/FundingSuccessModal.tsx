"use client";
import Link from "next/link";
import Image from "next/image";

interface FundingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundingSuccessModal({
  isOpen,
  onClose,
}: FundingSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-2xl rounded-md p-16 py-20 flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="flex flex-col gap-6 items-center justify-center mb-4 w-full">
          <Image src="/credit-card.png" alt="Credit Card" width={300} height={150} />
          <Image
            src="/withdraw-succ.svg"
            alt="Success"
            width={60}
            height={60}
          />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-[#333740] mb-2">
          Payment successful!
        </h2>

        {/* Subtitle */}
        <p className="text-[#333740] mb-4 text-sm">
          ₦250,000 has been added to your Bara wallet.
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
              Continue exporing scripts
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
