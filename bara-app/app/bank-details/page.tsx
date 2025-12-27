"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";
import { usePageGuard } from "@/app/hooks/usepageguard";

interface BankDetail {
  id: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountName: string;
  isVerified: boolean;
  createdAt: string;
}

interface Bank {
  name: string;
  code: string;
  country: string;
  currency: string;
  type: string;
  id: number;
}

import { Suspense } from "react";

function BankDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl");

  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState("");
  const [formData, setFormData] = useState({
    accountNumber: "",
    bankCode: "",
    bankName: "",
  });

  const loadData = async (id: string) => {
    try {
      setIsLoading(true);
      const bankDetailsResponse = await api.getBankDetails(id);
      if (bankDetailsResponse.success && bankDetailsResponse.data) {
        setBankDetails(bankDetailsResponse.data);
      }
      const banksResponse = await api.getBanks();
      if (banksResponse.success && banksResponse.data) {
        setBanks(banksResponse.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load bank details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const session = getUserSession();
    if (!session?.userId) return;
    setUserId(session.userId);

    loadData(session.userId);
  }, []);
  const handleBankSelect = (bankCode: string) => {
    const selectedBank = banks.find((bank) => bank.code === bankCode);
    if (selectedBank) {
      setFormData((prev) => ({
        ...prev,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = getUserSession();
    if (!session) return;

    if (!formData.accountNumber || !formData.bankCode) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsAddingBank(true);
      setError("");
      setSuccess("");

      const response = await api.addBankDetails(session.userId, {
        accountNumber: formData.accountNumber,
        bankCode: formData.bankCode,
        bankName: formData.bankName,
      });

      if (response.success) {
        setSuccess("Bank details added successfully");
        setFormData({ accountNumber: "", bankCode: "", bankName: "" });
        setShowAddForm(false);
        await loadData(session.userId); // Refresh list

        // Handle Return URL
        if (returnUrl) {
          setTimeout(() => {
            router.push(decodeURIComponent(returnUrl));
          }, 1000);
        }
      } else {
        setError(response.message || "Failed to add bank details");
      }
    } catch (error) {
      console.error("Error adding bank details:", error);
      setError("An error occurred while adding bank details");
    } finally {
      setIsAddingBank(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#22242A]">Bank Details</h1>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="bg-[#800000] text-white px-4 py-2 rounded-md hover:bg-[#600000] transition-colors"
          >
            Add Bank Account
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
            {returnUrl && (
              <p className="text-xs mt-1">Redirecting you back...</p>
            )}
          </div>
        )}

        {/* Add Bank Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#22242A]">
                Add New Bank Account
              </h2>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#22242A] mb-2">
                  Select Bank
                </label>
                <select
                  value={formData.bankCode}
                  onChange={(e) => handleBankSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                  required
                >
                  <option value="">Choose a bank</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#22242A] mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter your 10-digit account number"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingBank}
                  className="px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#600000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingBank ? "Adding..." : "Add Bank Account"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bank Details List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-[#22242A] mb-4">
              Your Bank Accounts
            </h2>

            {bankDetails.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <p className="text-gray-500">No bank accounts added yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add a bank account to receive payments
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bankDetails.map((bank) => (
                  <div
                    key={bank.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[#22242A]">
                          {bank.bankName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {bank.accountNumber} • {bank.accountName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Added on{" "}
                          {new Date(bank.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bank.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {bank.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BankDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BankDetailsContent />
    </Suspense>
  );
}
