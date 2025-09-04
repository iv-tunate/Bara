"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/utils/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const canSubmit = email.trim() !== "" && email.includes("@");

  const handleForgotPassword = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await api.forgotPassword({ Email: email });

      if (response.success) {
        setSuccess(true);
         router.push(
           `/auth/otp-verification?email=${encodeURIComponent(email)}`
         );
      } else {
        setError(
          response.message || "Failed to send reset email. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a0000]">
      <div className="bg-white rounded-lg shadow-md w-full max-w-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Bara Logo" width={60} height={40} />
        </div>

        {/* Inner content wrapper to control width */}
        <div className="w-full max-w-sm mx-auto">
          {/* Title */}
          <h1 className="text-xl font-semibold text-[#22242A] mb-2">
            Forgot password
          </h1>
          <p className="text-sm text-[#333740] mb-6">
            Don’t worry, we’ll send you a message to help you reset your
            password.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">
                Password reset link sent to your email!
              </p>
            </div>
          )}

          {/* Email Input */}
          <label className="block text-sm font-medium text-[#22242A] mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#ABADB2] rounded-md px-3 py-3 mb-4 bg-white 
              focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
          />

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={!canSubmit || isLoading}
            className={`w-full font-medium py-3 rounded-md flex items-center justify-center transition-colors mb-4 ${
              canSubmit && !isLoading
                ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
            }`}
          >
            {isLoading ? "Sending..." : "Continue"}
          </button>

        </div>
      </div>
    </div>
  );
}
