"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Suspense } from "react";
import { generateDeviceFingerprint } from "@/utils/deviceDetection";
function VerifyEmailPageContent() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationState, setVerificationState] = useState<
    "idle" | "success" | "failed" | "alreadyVerified"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const verifyUrl = process.env.NEXT_PUBLIC_VERIFY_EMAIL;
  const resendVerificationTokenUrl =
    process.env.NEXT_PUBLIC_RESEND_VERIFICATION_TOKEN;

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);

      if (verificationState === "failed") {
        setVerificationState("idle");
        setErrorMessage("");
      }
    }
  };

  const canContinue = otp.length === 6 && !isVerifying;

  const handleContinue = async () => {
    if (!canContinue) return;

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${baseUrl}${verifyUrl}/${email}/${otp}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.ok) {
        toast.success("Email verified successfully!");
        setVerificationState("success");

        const rawUserType = localStorage.getItem("userType") || "";
        const userType = rawUserType.toLowerCase();

        if (userType === "writer" || userType === "producer") {
          setTimeout(() => router.push(`/profile/${userType}`), 1000);
        } else {
          setTimeout(() => router.push("/profile"), 1000);
        }
      } else {
        const res = await response.json();
        const errorMsg = res.message || "Verification failed";

        if (res.statusCode === 409) {
          toast.success(res.message || "Email already verified!");
          setVerificationState("alreadyVerified");
          setTimeout(() => router.push("/profile"), 1000);
        } else {
          setErrorMessage(errorMsg);
          setVerificationState("failed");
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      const errorMsg = "Something went wrong. Please try again.";
      setErrorMessage(errorMsg);
      setVerificationState("failed");
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);
    const deviceFingerprint = generateDeviceFingerprint();
    
    try {
      const response = await fetch(
        `${baseUrl}${resendVerificationTokenUrl}/${email}/register/${deviceFingerprint}`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const res = await response.json();

      if (response.ok) {
        toast.success("Verification email resent! Please check your inbox.");
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(res.message || "Could not resend verification email.");
      }
    } catch {
      toast.error("Something went wrong while resending.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a0000] px-4">
      <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl h-[550px] relative">
        {/* Left: Form */}
        <div className="flex-1 md:p-12 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="mb-8">
              <Image
                src="/logo.png"
                alt="Bara Logo"
                width={60}
                height={40}
                className="h-auto w-auto"
              />
            </div>

            <h1 className="text-2xl font-semibold mb-2 text-[#22242A]">
              Verify your email
            </h1>

            <p className="text-sm text-[#333740] mb-6 leading-relaxed">
              An OTP has been sent to{" "}
              <span className="font-semibold">{email}</span>. Enter the 6-digit
              code below.
            </p>

            {verificationState === "failed" && errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            <label className="block text-sm font-medium text-[#22242A] mb-2">
              Verification Code
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              className={`w-full border rounded-md px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-1 transition-colors ${
                verificationState === "failed"
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-[#ABADB2] focus:ring-[#800000] focus:border-[#800000]"
              }`}
            />

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className={`w-full font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
                canContinue
                  ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                  : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <span className="ml-2 text-lg">→</span>
                </>
              )}
            </button>

            {/* Success / Already Verified message under button */}
            {(verificationState === "success" ||
              verificationState === "alreadyVerified") && (
              <div className="mt-4 text-center">
                <div className="mb-2">
                  <Image
                    src="/Check_ring.png"
                    alt={
                      verificationState === "success"
                        ? "Success"
                        : "Already Verified"
                    }
                    width={48}
                    height={48}
                    className="mx-auto"
                  />
                </div>
                <p className="text-sm text-[#333740]">
                  {verificationState === "success"
                    ? "Email verified successfully! Redirecting..."
                    : "Email already verified! Redirecting..."}
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-[#333740] mb-3">
                Didn&apos;t receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className={`font-medium py-2 px-4 rounded-md transition-colors ${
                  isResending || resendCooldown > 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#F5F5F5] text-[#800000] hover:bg-[#FFBFBF]"
                }`}
              >
                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Code"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="md:w-1/2 relative hidden md:flex items-center justify-center p-8">
          <Image
            src="/Mask group.png"
            alt="Verify Illustration"
            width={350}
            height={350}
            className="object-contain"
          />
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading verify email form…</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
