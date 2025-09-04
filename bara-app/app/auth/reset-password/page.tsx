"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EyeToggle from "@/components/EyeToggle";
import { Suspense } from "react";

function ResetPasswordPageContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();

  const isValidPassword = newPassword.length >= 8;
  const doPasswordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";
  const canSubmit = isValidPassword && doPasswordsMatch;

  // 👉 Show success automatically when valid + match
  useEffect(() => {
    if (canSubmit) {
      setShowSuccess(true);
    } else {
      setShowSuccess(false);
    }
  }, [canSubmit]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

   
    router.push("/auth/login");
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
          <h1 className="text-xl font-semibold text-[#22242A] mb-2">
            Reset password
          </h1>
          <p className="text-sm text-[#333740] mb-6">
            Set a new password for your account
          </p>

          <form onSubmit={handleContinue}>
            {/* New Password */}
            <label className="block text-sm font-medium text-[#22242A] mb-2">
              New password
            </label>
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 bg-white focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
                required
                minLength={8}
              />
              <EyeToggle
                isVisible={showPassword}
                onToggle={() => setShowPassword((p) => !p)}
              />
            </div>

            {/* Password hint with check icon */}
            <div className="flex items-center gap-2 mb-4 mt-1">
              {isValidPassword && (
                <Image src="/check.png" alt="valid" width={16} height={16} />
              )}
              <p
                className={`text-sm ${
                  isValidPassword ? "text-[#0DA500]" : "text-[#333740]"
                }`}
              >
                Use 8 characters or more
              </p>
            </div>

            {/* Confirm Password */}
            <label className="block text-sm font-medium text-[#22242A] mb-2">
              Confirm new password
            </label>
            <div className="relative mb-2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
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

            {/* Show mismatch error */}
            {newPassword && confirmPassword && !doPasswordsMatch && (
              <p className="text-xs text-red-600 mb-4">
                Passwords do not match
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full font-medium py-3 rounded-md flex items-center justify-center transition-colors ${
                canSubmit
                  ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                  : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            {/* ✅ Success Message */}
            {showSuccess && (
              <div className="mx-auto mt-6 w-72 flex items-center justify-center border border-[#0DA500] rounded-md px-2 py-2 text-[#0DA500] bg-[#C3E8BF] text-sm font-medium gap-2">
                <Image
                  src="/Check_ring.png"
                  alt="Success Icon"
                  width={16}
                  height={16}
                  className="object-contain"
                />
                Password successfully reset!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading reset form…</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
