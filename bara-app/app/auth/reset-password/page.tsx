"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import EyeToggle from "@/components/EyeToggle";
import { api } from "@/utils/api";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const canSubmit = 
    email.trim() !== "" && 
    token.trim() !== "" && 
    newPassword.trim() !== "" && 
    confirmPassword.trim() !== "" &&
    newPassword === confirmPassword &&
    newPassword.length >= 6;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await api.resetPassword({
        Email: email,
        Token: token,
        NewPassword: newPassword,
      });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a0000]">
        <div className="bg-white rounded-lg shadow-md w-full max-w-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Bara Logo" width={60} height={40} />
          </div>

          {/* Success Content */}
          <div className="w-full max-w-sm mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-[#22242A] mb-4">
              Password Reset Successful
            </h1>
            <p className="text-sm text-[#333740] mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>

            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="w-full bg-[#800000] text-white font-medium py-3 rounded-md hover:bg-[#1a0000] transition-colors"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Reset Password
          </h1>
          <p className="text-sm text-[#333740] mb-6">
            Enter your new password below.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword}>
            {/* Email */}
            <label className="block text-sm font-medium text-[#22242A] mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
              required
            />

            {/* Reset Token */}
            <label className="block text-sm font-medium text-[#22242A] mb-2">
              Reset Token
            </label>
            <input
              type="text"
              placeholder="Enter the token from your email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
              required
            />

            {/* New Password */}
            <label className="block text-sm font-medium text-[#22242A] mb-2">
              New Password
            </label>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 bg-white focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
                required
                minLength={6}
              />
              <EyeToggle
                isVisible={showPassword}
                onToggle={() => setShowPassword((p) => !p)}
              />
            </div>

            {/* Confirm Password */}
            <label className="block text-sm font-medium text-[#22242A] mb-2">
              Confirm New Password
            </label>
            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 bg-white focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
                required
              />
              <EyeToggle
                isVisible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((p) => !p)}
              />
            </div>

            {/* Password Validation Messages */}
            {newPassword && newPassword.length < 6 && (
              <p className="text-xs text-red-600 mb-2">Password must be at least 6 characters long</p>
            )}
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600 mb-2">Passwords do not match</p>
            )}

            {/* Reset Button */}
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className={`w-full font-medium py-3 rounded-md flex items-center justify-center transition-colors mb-4 ${
                canSubmit && !isLoading
                  ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                  : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
              }`}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
              {!isLoading && <span className="ml-2 text-lg">→</span>}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="text-[#333740] hover:text-[#800000] transition-colors text-sm"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
