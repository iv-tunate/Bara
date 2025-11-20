"use client";

import { useState, useEffect } from "react";

export type Currency = "NAIRA" | "USD" | "EUR" | "GBP";

const FALLBACK_RATES: Record<Currency, number> = {
  NAIRA: 1,
  USD: 1 / 1500,
  EUR: 1 / 1820,
  GBP: 1 / 2000,
};

interface UseMinPriceReturn {
  minAllowed: number; 
  rate: number; 
  fetchError: string | null; 
  resError: string | null; 
  loading: boolean;
  validatePrice: (price: number) => boolean;
}

export function useMinPrice(
  currency: Currency,
  minInNaira: number,
  price?: number
): UseMinPriceReturn {
  const [rate, setRate] = useState<number>(FALLBACK_RATES[currency]);
  const [minAllowed, setMinAllowed] = useState<number>(
    currency === "NAIRA" ? minInNaira : minInNaira * FALLBACK_RATES[currency]
  );
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [resError, setResError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchRate() {
      if (currency === "NAIRA") {
        setRate(1);
        setMinAllowed(minInNaira);
        setFetchError(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `https://api.exchangeratesapi.io/v1/convert?from=NGN&to=${currency}&amount=${minInNaira}&access_key=${process.env.NEXT_PUBLIC_EXCHANGEAPI_KEY}`,
          { headers: { Accept: "application/json" } }
        );
        const data = await res.json();

        if (!data.success || typeof data.result !== "number") {
          throw new Error("Invalid API response");
        }

        setRate(data.info.rate); 
        setMinAllowed(data.result); 
        setFetchError(null);
      } catch (e) {
        console.error("Failed to fetch exchange rate, using fallback:", e);
        const fallbackRate = FALLBACK_RATES[currency];
        setRate(fallbackRate);
        setMinAllowed(minInNaira * fallbackRate);
        setFetchError(
          "Could not fetch live exchange rate; using fallback conversion."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRate();
  }, [currency, minInNaira]);

  useEffect(() => {
    if (price !== undefined) {
      if (price < minAllowed) {
        setResError(`Minimum allowed is ${minAllowed.toFixed(2)} ${currency}`);
      } else {
        setResError(null);
      }
    }
  }, [price, minAllowed, currency]);

  const validatePrice = (value: number) => {
    if (value < minAllowed) {
      setResError(`Minimum allowed is ${minAllowed.toFixed(2)} ${currency}`);
      return false;
    }
    setResError(null);
    return true;
  };

  return { minAllowed, rate, fetchError, resError, loading, validatePrice };
}
