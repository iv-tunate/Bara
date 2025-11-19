"use client";

import Image from "next/image";
import { useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import WithdrawSuccessModal from "@/components/withdrawSuccessModal";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  if (!isOpen) return null;

  const isFormValid =
    amount.trim() !== "" &&
    bank.trim() !== "" &&
    accountNumber.trim().length === 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSuccessModalOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <DashboardNavbar />

      {/* Back Button */}
      <button
        onClick={onClose}
        className="cursor-pointer mt-6 ml-6 md:ml-24 mb-4"
      >
        <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
      </button>

      <div className="max-w-2xl mx-auto px-6 md:px-10 py-4 flex flex-col gap-10">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">Withdraw funds</h2>
          <p className="text-gray-700 mt-1">
            Withdraw your available balance securely to your bank account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Enter Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm text-gray-800 mb-1"
            >
              Enter amount
            </label>

            <div className="flex items-center border border-[#ABADB2] rounded-sm px-3 py-2 gap-3">
              {/* Currency section */}
              <div className="flex items-center gap-2 border border-[#ABADB2] rounded-sm px-2 py-1">
                <Image src="/naijaFlag.svg" alt="NGN" width={20} height={20} />
                <p className="text-sm">NGN</p>
                <Image
                  src="/dropdown.svg"
                  alt="Dropdown"
                  width={10}
                  height={10}
                />
              </div>

              {/* Amount Input */}
              <input
                type="number"
                id="amount"
                placeholder="400,000"
                className="w-full border-none focus:outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Bank Name */}
          <div className="relative">
            <label htmlFor="bank" className="block text-sm text-gray-800 mb-1">
              Bank name
            </label>

            <select
              id="bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="border border-[#ABADB2] p-2 w-full rounded-sm focus:outline-none appearance-none"
              required
            >
              <option value="">Select bank</option>
              <option value="Access Bank">Access Bank</option>
              <option value="GTBank">GTBank</option>
              <option value="First Bank">First Bank</option>
            </select>

            {/* Custom Arrow */}
            <Image
              src="/dropdown.svg"
              alt="Dropdown Arrow"
              width={10}
              height={10}
              className="absolute right-3 top-10 pointer-events-none"
            />
          </div>

          {/* Account Number */}
          <div>
            <label
              htmlFor="accountNumber"
              className="block text-sm text-gray-800 mb-1"
            >
              Account number
            </label>

            <input
              type="number"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="border border-[#ABADB2] p-2 w-full rounded-sm focus:outline-none"
              placeholder="Account number"
              maxLength={10}
            />

            {/* Auto-filled name */}
            {accountNumber.length === 10 && (
              <p className="text-sm text-right mt-1 font-medium">
                TIMOTHY SEUN EDWARDS
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full px-4 py-2 rounded-sm transition 
              ${
                isFormValid
                  ? "bg-[#810306] text-white cursor-pointer hover:bg-[#810306]/70"
                  : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
              }`}
          >
            Continue
          </button>

          {/* Save Bank Checkbox */}
          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              className="
              accent-[#810306] h-4 w-4 cursor-pointer checked:
    "
            />
            <span className="ml-2 text-sm text-gray-700">
              Save this bank account for future payouts
            </span>
          </label>
        </form>
      </div>

      {/* Success Modal */}
      <WithdrawSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      />
    </div>
  );
}
