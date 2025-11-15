"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Submitting withdrawal request...");

    // On successful withdrawal:
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 z-50">
      <DashboardNavbar />
      <div className="max-w-3xl mx-auto mt-15 px-4 md:px-10 lg:px-10 py-4 flex flex-col gap-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Withdraw Funds</h2>
          <p>Withdraw your available balance securely to your bank account.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Amount Input */}
          <div className="mb-4">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter Amount
            </label>
            <div className="flex flex-row border-1 border-[#ABADB2] p-2 w-full rounded-sm gap-2">
              <div className="flex flex-row border-1 border-[#ABADB2] gap-5 rounded-sm px-2">
                <div className="flex flex-row gap-1">
                  <Image
                    src="/naijaFlag.svg"
                    alt="Nigerian Naira"
                    width={24}
                    height={24}
                  />
                  <p>NGN</p>
                </div>
                <Image
                  src="/dropdown.svg"
                  alt="Dropdown Arrow"
                  width={9}
                  height={12}
                />
              </div>
              <input
                type="decimal"
                id="amount"
                required
                className="w-full border-none focus:outline-none"
              />
            </div>
          </div>

          {/* Bank Selection */}
          <div className="relative mb-6">
            <label
              htmlFor="bank"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bank Name
            </label>
            <select
              id="bank"
              className="border-1 border-[#ABADB2] p-2 w-full rounded-sm focus:outline-none appearance-none"
              required
            >
              <option value="" selected></option>
              <option value="GTBank">GTBank</option>
              <option value="FirstBank">First Bank</option>
            </select>
            <div>
              <Image
                src="/dropdown.svg"
                alt="Dropdown Arrow"
                width={9}
                height={12}
                className="absolute inset-y-0 right-3 top-11 pointer-events-none"
              />
            </div>
          </div>

          {/* Account Number Input */}
          <div className="mb-6">
            <label
              htmlFor="accountNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account Number
            </label>
            <input
              id="accountNumber"
              className="border-1 border-[#ABADB2] p-2 w-full rounded-sm focus:outline-none"
              required
            />
          </div>

          {/* Buttons */}
          <div>
            <button
              type="submit"
              className="bg-[#cfcfd1] hover:bg-[#810306] text-[#858990] hover:text-white w-full px-4 py-2 rounded-sm transition disabled:bg-gray-400"
            >
              Submit
            </button>
          </div>

          {/* Remember Me Checkbox */}
          <div className="mb-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="scale-150 border-1 border-[#810306]"
              />
              <span className="ml-2 text-sm text-gray-700">
                Save this bank account for future payouts
              </span>
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}
