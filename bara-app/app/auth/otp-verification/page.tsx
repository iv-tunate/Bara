"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OtpVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; 
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

  
    router.push("/auth/reset-password");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a0000]">
      <div className="bg-white rounded-lg shadow-md w-full max-w-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Bara Logo" width={60} height={40} />
        </div>

        {/* Inner wrapper */}
        <div className="w-full max-w-sm mx-auto">
          {/* Title */}
          <h1 className="text-xl font-semibold text-[#22242A] mb-2">
            Let us know it is you
          </h1>
          <p className="text-sm text-[#333740] mb-6">
            We have sent a code to{" "}
            <span className="font-medium">janedoe@gmail.com</span>. Enter the
            code below to verify your account.
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Code Label */}
          <label className="block text-sm font-medium text-[#22242A] mb-2">
            Code
          </label>

          {/* OTP Inputs */}
          <div className="flex justify-between mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-12 h-12 border border-[#ABADB2] rounded-md text-center text-lg focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
              />
            ))}
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={otp.join("").length !== 6}
            className={`w-full font-medium py-3 rounded-md flex items-center justify-center transition-colors mb-4 ${
              otp.join("").length !== 6
                ? "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
                : "bg-[#800000] text-white hover:bg-[#1a0000]"
            }`}
          >
            Continue
          </button>

        </div>
      </div>
    </div>
  );
}
