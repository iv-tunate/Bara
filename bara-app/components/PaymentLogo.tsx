import React from "react";
import Image from "next/image";

interface PaymentLogoProps {
  method?: string;
  type?: string;
  className?: string; // Allow passing extra classes
}

const PaymentLogo: React.FC<PaymentLogoProps> = ({
  method = "",
  type = "",
  className = "",
}) => {
  const methodLower = method.toLowerCase();
  const typeLower = type.toLowerCase();

  // 1. Withdrawal (Generic Bank Icon)
  // Prioritize this to ensure withdrawals always show the bank icon, regardless of the underlying channel (e.g., 'bank_transfer')
  if (
    typeLower.includes("withdrawal") ||
    (methodLower.includes("transfer") && !typeLower.includes("funding"))
  ) {
    return (
      <div
        className={`w-10 h-10 bg-[#FFF5F5] rounded-full flex items-center justify-center border border-[#FED7D7] ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="#E53E3E"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
          />
        </svg>
      </div>
    );
  }

  // 2. Stripe Logo
  if (methodLower.includes("stripe")) {
    return (
      <div
        className={`w-10 h-10 bg-[#F4F4F5] rounded-full flex items-center justify-center border border-gray-200 ${className}`}
      >
        <span className="font-bold text-lg text-[#635BFF]">S</span>
      </div>
    );
  }

  // 3. Paystack Logo
  // Includes explicit "paystack", specific channels (card, bank, etc.), OR generic "wallet funding" (default provider)
  const isPaystack =
    methodLower.includes("paystack") ||
    methodLower.includes("card") ||
    methodLower.includes("bank") || // Covers 'bank' channel
    methodLower.includes("ussd") ||
    methodLower.includes("qr") ||
    methodLower.includes("mobile_money") ||
    typeLower.includes("funding");

  if (isPaystack) {
    return (
      <div
        className={`w-10 h-10 bg-[#EBF8FF] rounded-full flex items-center justify-center border border-[#BEE3F8] ${className}`}
      >
        <div className="flex flex-col gap-[2px]">
          <span className="block w-2.5 h-1 rounded-sm bg-[#0AA5FF]" />
          <span className="block w-3.5 h-1 rounded-sm bg-[#2EC4FF]" />
          <span className="block w-4.5 h-1 rounded-sm bg-[#5AD8FF]" />
        </div>
      </div>
    );
  }

  // Default / Bara Logo
  return (
    <div
      className={`relative w-10 h-10 rounded-full overflow-hidden ${className}`}
    >
      {/* Fallback to Bara logo or user avatar placeholder */}
      <div className="w-full h-full bg-[#810306] flex items-center justify-center text-white font-bold text-xs">
        B
      </div>
      {/* Ideally you would use Image here if you have a Bara logo asset */}
      {/* <Image src="/bara-logo.png" alt="Bara" fill className="object-cover" /> */}
    </div>
  );
};

export default PaymentLogo;
