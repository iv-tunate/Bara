"use client";
import Image from "next/image";
import { useState, FormEvent } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";
import toast from "react-hot-toast";

interface FundAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundAccount({ isOpen, onClose }: FundAccountProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const userSession = getUserSession();

  if (!isOpen) return null;

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!userSession?.userId) {
      toast.error("User session invalid. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.initiateFundWallet(
        userSession.userId,
        Number(amount)
      );

      if (response.success && response.data?.paymentUrl) {
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
    <div>
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <DashboardNavbar />
        <button
          onClick={onClose}
          className="fixed cursor-pointer mt-24 ml-6 md:ml-24 mb-4 z-50 p-2 rounded-full hover:bg-gray-100"
        >
          <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
        </button>

        <div className="max-w-2xl mx-auto mt-32 px-6 md:px-10 py-4 flex flex-col gap-10">
          <div>
            <h2 className="text-2xl font-semibold">Fund your account</h2>
            <p className="text-gray-700 mt-1">
              Enter the amount you wish to add to your wallet. You will be
              redirected to Paystack to complete the secure payment.
            </p>
          </div>

          <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm text-gray-800 mb-1"
              >
                Amount
              </label>
              <div className="flex items-center border border-[#ABADB2] rounded-md px-3 py-3 gap-3">
                <div className="flex items-center gap-2 border-r pr-3 border-gray-300">
                  <Image
                    src="/naijaFlag.svg"
                    alt="NGN"
                    width={20}
                    height={20}
                  />
                  <p className="text-sm font-medium">NGN</p>
                </div>
                <input
                  type="number"
                  id="amount"
                  placeholder="5000"
                  className="w-full border-none focus:outline-none text-lg"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !amount}
              className={`w-full px-4 py-3 rounded-md transition font-medium text-lg ${
                loading || !amount
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#810306] text-white cursor-pointer hover:bg-[#6e0305]"
              }`}
            >
              {loading ? "Initializing Payment..." : "Continue to Paystack"}
            </button>
          </form>

          <div className="flex items-center gap-2 justify-center mt-4 opacity-70">
            <p className="text-xs text-center text-gray-500">Secured by</p>
            <Image
              src="/paystack_logo.png"
              alt="Paystack"
              width={80}
              height={15}
              className="object-contain" 
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="font-bold text-xs text-[#091F3E]">Paystack</span>
          </div>
        </div>
      </div>
    </div>
  );
}
