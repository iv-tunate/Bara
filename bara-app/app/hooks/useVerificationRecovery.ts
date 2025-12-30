"use client";

import { useEffect, useRef } from "react";
import { api } from "@/utils/api";
import toast from "react-hot-toast";

/**
this hooks checks local storage for pending verifications and retries them
 */
export function useVerificationRecovery() {
  const hasRecovered = useRef(false);

  useEffect(() => {
    if (hasRecovered.current) return;

    const recoverPendingVerification = async () => {
      try {
        const pendingStr = localStorage.getItem("pending_verification");
        if (!pendingStr) return;

        const pending = JSON.parse(pendingStr);
        const { reference, timestamp } = pending;

        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - timestamp > thirtyMinutes) {
          localStorage.removeItem("pending_verification");
          return;
        }

        hasRecovered.current = true;

        toast.loading("Completing your payment verification...");
        
        const result = await api.verifyPayment(reference);

        if (result.success) {
          localStorage.removeItem("pending_verification");
          toast.success("Payment verified successfully!");
        } else {
          toast.error("Payment verification failed");
          localStorage.removeItem("pending_verification");
        }
      } catch (error) {
        console.error("Recovery verification error:", error);
        toast.error("An error occurred while verifying your payment");
      }
    };

    recoverPendingVerification();
  }, []);
}
