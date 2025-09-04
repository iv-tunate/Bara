"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EyeToggle from "@/components/EyeToggle";
import Logo from "@/components/Logo";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();

  const isValidPassword = password.length >= 8;
  const doPasswordsMatch =
    password === confirmPassword && confirmPassword !== "";
  const canContinue = isValidPassword && doPasswordsMatch;

  const handleContinue = () => {
    if (canContinue) {
      setShowSuccess(true);

      // after 2.5 seconds, go to profile page
      setTimeout(() => {
        router.push("/profile");
      }, 2500);
    }
  };

  return (
    <main className="h-screen w-screen flex items-center justify-center bg-[#1a0000]">
      <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl h-[90%] md:h-[550px] overflow-hidden">
        {/* LEFT */}
        <div className="flex-1 md:p-12 flex flex-col justify-between">
          <div>
            <div className="mr-6">
              <Logo />
            </div>

            <h1 className="text-2xl font-semibold text-[#22242A] mb-2">
              Set password
            </h1>
            <p className="text-sm text-[#333740] mb-4">
              Set a strong password to protect your account
            </p>

            {/* Password */}
            <label className="block text-sm font-medium text-[#22242A] mb-2">
              Password
            </label>
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 bg-white 
                  focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
              />
              <EyeToggle
                isVisible={showPassword}
                onToggle={() => setShowPassword((p) => !p)}
              />
            </div>

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

            {/* Confirm */}
            <label className="block text-sm font-medium text-[#22242A] mb-2">
              Confirm password
            </label>
            <div className="relative mb-2">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 bg-white 
                  focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
              />
              <EyeToggle
                isVisible={showConfirm}
                onToggle={() => setShowConfirm((p) => !p)}
              />
            </div>
            {confirmPassword.length > 0 && !doPasswordsMatch && (
              <p className="text-red-600 text-sm mb-3">
                Passwords do not match.
              </p>
            )}
          </div>

          <div className="mt-2">
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`w-full font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
                canContinue
                  ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                  : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
              }`}
            >
              Create account
            </button>

            {showSuccess && (
              <div className="mx-auto mt-6 w-72 flex items-center justify-center border border-[#0DA500] rounded-md px-2 py-2 text-[#0DA500] text-sm font-medium gap-2">
                <Image
                  src="/Check_ring.png"
                  alt="Success Icon"
                  width={16}
                  height={16}
                  className="object-contain"
                />
                Your Bara account has been created!
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:w-1/2 hidden md:flex items-center justify-center p-8">
          <Image
            src="/Mask group.png"
            alt="Password Illustration"
            width={350}
            height={350}
            className="object-contain"
          />
        </div>
      </div>
    </main>
  );
}
