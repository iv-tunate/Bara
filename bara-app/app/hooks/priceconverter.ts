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
  resError: string | null;
  validatePrice: (price: number) => boolean;
  fetchError: string | null;
  loading: boolean;
}

export function useMinPrice(
  currency: Currency,
  minInNaira: number,
  price?: number
): UseMinPriceReturn {
  const [rate, setRate] = useState<number>(FALLBACK_RATES[currency]);
  const [minAllowed, setMinAllowed] = useState<number>(minInNaira * rate);
  const [resError, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
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
      debugger;
      try {
        const res = await fetch(
          `https://api.exchangeratesapi.io/v1/convert?from=NGN&to=${currency}&amount=1&${process.env.NEXT_PUBLIC_EXCHANGEAPI_KEY}`
        );
        const data = await res.json();
        if (!data.success || !data.info?.rate)
          throw new Error("Invalid API response");

        const liveRate = data.info.rate;
        setRate(liveRate);
        setMinAllowed(minInNaira * liveRate);
        setFetchError(null);
      } catch (e) {
        console.error("Failed to fetch rate, using fallback:", e);
        const fallbackRate = FALLBACK_RATES[currency];
        setRate(fallbackRate);
        setMinAllowed(minInNaira * fallbackRate);
        setFetchError("Could not fetch live exchange rate; using fallback.");
      } finally {
        setLoading(false);
      }
    }

    fetchRate();
  }, [currency, minInNaira]);

  useEffect(() => {
    if (price !== undefined) {
      if (price < minAllowed) {
        setError(`Minimum allowed is ${minAllowed.toFixed(2)} ${currency}`);
      } else {
        setError(null);
      }
    }
  }, [price, minAllowed, currency]);

  const validatePrice = (value: number) => {
    if (value < minAllowed) {
      setError(`Minimum allowed is ${minAllowed.toFixed(2)} ${currency}`);
      return false;
    }
    setError(null);
    return true;
  };

  return { minAllowed, rate, resError, validatePrice, fetchError, loading };
}
