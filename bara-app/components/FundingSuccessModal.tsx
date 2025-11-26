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
    <div className="fixed inset-0 flex bg-black/40 backdrop-blur-sm z-50 px-4">
      <button
        onClick={onClose}
        className="fixed cursor-pointer mt-30 ml-6 md:ml-105 mb-4"
      >
        <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
      </button>
      {/* Modal Card */}
      <div className="flex items-center justify-center mx-auto my-auto bg-white w-full max-w-3xl rounded-md p-16 py-20 text-center">
        <div>
          {/* Success Icon */}
          <div className="flex flex-col gap-6 items-center justify-center mb-4 w-full">
            <Image
              src="/credit-card.png"
              alt="Credit Card"
              width={300}
              height={150}
            />
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
    </div>
  );
}
