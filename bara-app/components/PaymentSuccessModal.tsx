"use client";
import Image from "next/image";
import Link from "next/link";

interface PaymentSuccessModalProps {
  onClose: () => void;
}

export default function PaymentSuccessModal({
  onClose,
}: PaymentSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0  bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* center modal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div
          className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl px-6 md:px-12 py-10 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* top-left back link with image */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-[#22242A]"
          >
            <Image src="/Arrow_left.png" alt="Back" width={16} height={16} />
            Continue exploring scripts
          </button>

          {/* card image */}
          <div className="flex justify-center mt-8">
            <Image
              src="/card.png"
              alt="Card"
              width={309}
              height={157}
              className="rounded-md"
            />
          </div>

          {/* success icon */}
          <div className="flex justify-center">
            <Image
              src="/checkring.png"
              alt="Success"
              width={50}
              height={50}
              className="rounded-md"
            />
          </div>

          {/* text */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-[#22242A]">
              Payment successful!!
            </h2>
            <p className="text-sm text-[#333740] max-w-xl mx-auto break-words px-30">
              You’ve successfully secured this script. The writer has been
              notified and you now have 14 days to review the script and
              collaborate.
            </p>
          </div>

          {/* buttons */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/dashboard/scripts/ViewSynopsis"
              className="bg-[#810306] hover:bg-[#1a0000] text-white py-3 px-28 rounded-md text-sm font-medium text-center"
            >
              View synopsis
            </Link>
            <Link
              href="/dashboard/scripts/ViewScript"
              className="border border-[#810306] text-[#810306] py-3 px-30 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#fff5f5]"
            >
              View script
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
