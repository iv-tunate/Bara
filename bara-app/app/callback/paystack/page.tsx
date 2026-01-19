"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DashboardNavbar from "@/components/DashboardNavbar";
import { api } from "@/utils/api";
import { usePageGuard } from "@/app/hooks/usepageguard";
import toast from "react-hot-toast";

function PaystackCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference =
    searchParams?.get("reference") || searchParams?.get("trxref");

  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying",
  );
  const [message, setMessage] = useState(
    "We are confirming your transaction with Paystack...",
  );
  const hasVerified = useRef(false);

  usePageGuard();

  useEffect(() => {
    if (!reference || hasVerified.current) return;

    const verifyTransaction = async () => {
      hasVerified.current = true;

      if (reference) {
        localStorage.setItem(
          "pending_verification",
          JSON.stringify({
            reference,
            timestamp: Date.now(),
          }),
        );
      }

      try {
        const result = await api.verifyPayment(reference);

        if (result.success) {
          setStatus("success");
          setMessage("Payment verified successfully!");

          localStorage.removeItem("pending_verification");
          toast.success("Payment verified successfully!");
          setTimeout(() => {
            router.push("/wallet");
          }, 2500);
        } else {
          setStatus("failed");
          setMessage(result.message || "Payment verification failed.");
          localStorage.removeItem("pending_verification");
          toast.error(result.message || "Payment verification failed.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        setMessage("An unexpected error occurred while verifying.");
        toast.error("An unexpected error occurred while verifying.");
      }
    };

    if (reference) {
      verifyTransaction();
    } else {
      setStatus("failed");
      setMessage("No transaction reference found.");
    }
  }, [reference, router]);

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center p-4 transition-all duration-500
          ${status === "verifying" ? "bg-gray-100" : ""}
          ${status === "success" ? "bg-[#C3E8BF]" : ""}
          ${status === "failed" ? "bg-[#FFEDEE]" : ""}
        `}
        >
          {status === "verifying" && (
            <div className="w-12 h-12 border-4 border-gray-300 border-t-[#810306] rounded-full animate-spin" />
          )}

          {status === "success" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-[#0DA500]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}

          {status === "failed" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-[#810306]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#22242A]">
            {status === "verifying" && "Verifying Payment"}
            {status === "success" && "Payment Successful"}
            {status === "failed" && "Verification Failed"}
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">{message}</p>
        </div>

        <div className="mt-6">
          {status === "failed" && (
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/wallet/fund")}
                className="px-6 py-3 bg-[#810306] text-white rounded-lg font-semibold hover:bg-[#6e0305] transition"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/wallet")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Go to Wallet
              </button>
            </div>
          )}

          {status === "success" && (
            <button
              onClick={() => router.push("/wallet")}
              className="px-8 py-3 bg-[#810306] text-white rounded-lg font-semibold hover:bg-[#6e0305] transition"
            >
              Continue to Wallet
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PaystackCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#810306] rounded-full animate-spin" />
        </main>
      }
    >
      <PaystackCallbackContent />
    </Suspense>
  );
}
