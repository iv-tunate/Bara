"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EyeToggle from "@/components/EyeToggle";
import { api } from "@/utils/api";
import { generateDeviceFingerprint } from "@/utils/deviceDetection";
import { setUserSession } from "@/utils/tokenManager";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  const router = useRouter();

  const canLogin = email.trim() !== "" && password.trim() !== "";

  const handleLogin = async () => {
    if (!canLogin) return;
    setIsLoading(true);
    setError("");

    try {
      const deviceFingerprint = generateDeviceFingerprint();

      const response = await api.login({
        Email: email,
        Password: password,
        LoginDevice: deviceFingerprint,
      });

      if (response.success && response.data) {
        if (response.data.accessToken) {
          setUserSession({
            userId: response.data.userId,
            email: response.data.email,
            name: response.data.name,
            userType: response.data.userType || "Unknown",
            accessToken: response.data.accessToken,
            wrongLoginAttempts: response.data.wrongLoginAttempts,
          });

          router.push("/dashboard");
        } else {
          setNeedsVerification(true);
        }
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLogin = async () => {
    if (!verificationToken.trim()) {
      setError("Please enter the verification token.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const deviceFingerprint = generateDeviceFingerprint();

      const response = await api.verifyLogin({
        Email: email,
        Token: verificationToken,
        Device: deviceFingerprint,
      });

      if (response.success && response.data) {
        setUserSession({
          userId: response.data.userId,
          email: response.data.email,
          name: response.data.name,
          userType: response.data.userType || "Unknown",
          accessToken: response.data.accessToken,
          wrongLoginAttempts: response.data.wrongLoginAttempts,
        });

        router.push("/dashboard");
      } else {
        setError(response.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a0000] px-4">
      {/* White container card */}
      <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-5xl h-[600px] overflow-hidden">
        {/* Left: 40% width full-bleed image */}
        <div className="hidden md:block md:w-2/5 relative">
          <Image
            src="/family.png"
            alt="Login Illustration"
            fill
            className="object-cover object-left-top"
            priority
          />
        </div>

        {/* Right: Form Section (60%) */}
        <div className="flex-1 md:w-3/5 flex flex-col justify-center items-center px-6 md:px-12 overflow-y-auto">
          <div className="w-full max-w-sm">
            {" "}
            {/* Logo */}
            {/* Logo (left-aligned) */}
            <div className="mb-4 self-start">
              <Image src="/logo.png" alt="Bara Logo" width={70} height={40} />
            </div>
            {/* Heading (left-aligned) */}
            <h1 className="text-2xl font-semibold mb-8 text-[#22242A] text-left">
              {needsVerification ? "Verify Login" : "Log in"}
            </h1>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {needsVerification ? (
              /* Verification Form */
              <>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    We've sent a verification code to your email. Please enter
                    it below to complete your login.
                  </p>
                </div>

                <label className="block text-sm font-medium text-[#22242A] mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
                  maxLength={6}
                />

                <button
                  type="button"
                  onClick={handleVerifyLogin}
                  disabled={!verificationToken.trim() || isLoading}
                  className={`w-full font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
                    verificationToken.trim() && !isLoading
                      ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                      : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Verifying..." : "Verify Login"}
                  {!isLoading && <span className="ml-2 text-lg">→</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNeedsVerification(false);
                    setVerificationToken("");
                    setError("");
                  }}
                  className="w-full mt-3 text-sm text-[#333740] hover:text-[#800000] transition-colors"
                >
                  ← Back to login
                </button>
              </>
            ) : (
              <>
                {/* Google Login */}
                <button
                  type="button"
                  className="w-full bg-[#800000] text-white font-medium py-3 rounded-md hover:bg-[#1a0000] flex items-center justify-center gap-4 mb-6"
                >
                  <Image
                    src="/Google.png"
                    alt="Google Icon"
                    width={20}
                    height={20}
                  />
                  Log in with Google
                </button>
                <div className="flex items-center justify-center my-4">
                  <span className="text-sm text-[#333740]">or</span>
                </div>
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
                />
                {/* Password */}
                <label className="block text-sm font-medium text-[#22242A] mb-2">
                  Password
                </label>
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                {/* Forgot Password + Actions */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <a
                    href="/auth/forgot-password"
                    className="text-[#333740] font-medium text-medium"
                  >
                    Forgot your password?
                  </a>
                </div>
                {/* Login Button */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={!canLogin || isLoading}
                  className={`w-full font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
                    canLogin && !isLoading
                      ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                      : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                  {!isLoading && <span className="ml-2 text-lg">→</span>}
                </button>
                {/* Create Account */}
                <p className="text-sm text-center mt-6 text-[#333740] font-medium text-medium">
                  Don’t have an account?{" "}
                  <a
                    href="/auth/register"
                    className="text-[#810306] underline font-medium text-medium"
                  >
                    Create account
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
