"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";
import { usePageGuard } from "@/app/hooks/usepageguard";
import toast from "react-hot-toast";

function FundWalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAmount = searchParams?.get("amount") || "";

  const [amount, setAmount] = useState(initialAmount);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "stripe">(
    "paystack"
  );

  const userSession = getUserSession();
  usePageGuard();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!userSession?.userId) {
      toast.error("User session invalid. Please log in again.");
      return;
    }

    if (paymentMethod === "stripe") {
      toast.error("Stripe payment is coming soon!");
      return;
    }

    try {
      setLoading(true);
      const request = await api.initiateFundWallet(
        userSession.userId,
        Number(amount)
      );

      const response = request.data;
      if (response.isSuccess && response.data?.paymentUrl) {
        toast.success("Redirecting to Paystack...");
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error(response.message || "Failed to initiate payment");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-2xl mx-auto px-6 md:px-10 py-8 flex flex-col gap-8">
        {/* Header */}
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#810306] mb-6 transition-colors"
          >
            <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
            <span className="font-medium">Back</span>
          </button>

          <h1 className="text-2xl font-bold text-[#22242A]">
            Fund your wallet
          </h1>
          <p className="text-gray-600 mt-2">
            Select a payment method and enter the amount you wish to add.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Payment Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paystack Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("paystack")}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === "paystack"
                    ? "border-[#810306] bg-[#FFEDEE]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-[3px]">
                      <span className="block w-3 h-1.5 rounded-sm bg-[#0AA5FF]" />
                      <span className="block w-4 h-1.5 rounded-sm bg-[#2EC4FF]" />
                      <span className="block w-5 h-1.5 rounded-sm bg-[#5AD8FF]" />
                    </div>

                    <span className="font-bold text-lg text-[#0AA5FF]">P</span>
                  </div>
                  <span className="font-semibold text-[#22242A]">Paystack</span>
                </div>
                {paymentMethod === "paystack" && (
                  <div className="w-5 h-5 rounded-full bg-[#810306] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>

              {/* Stripe Option (Disabled) */}
              <button
                type="button"
                disabled
                className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100">
                    <span className="font-bold text-lg text-[#635BFF]">S</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-gray-500">Stripe</span>
                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-600 font-medium">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Amount Form */}
          <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-6">
            <div className="space-y-3">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount to Fund
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-semibold">₦</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  placeholder="5000"
                  className="w-full pl-8 pr-4 py-3 border border-[#ABADB2] rounded-xl focus:outline-none focus:border-[#810306] focus:ring-1 focus:ring-[#810306] transition-colors"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Minimum deposit: ₦100</p>
            </div>

            <button
              type="submit"
              disabled={loading || !amount || Number(amount) <= 0}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all transform active:scale-[0.99] ${
                loading || !amount
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#810306] hover:bg-[#6e0305] shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Fund ₦${amount ? Number(amount).toLocaleString() : "0.00"}`
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">Secured by Paystack</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function FundWalletPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-[#810306]/30 border-t-[#810306] rounded-full animate-spin" />
        </div>
      }
    >
      <FundWalletContent />
    </Suspense>
  );
}
