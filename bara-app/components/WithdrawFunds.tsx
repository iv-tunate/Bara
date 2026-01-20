"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import WithdrawSuccessModal from "@/components/withdrawSuccessModal";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";
import { useWallet } from "@/context/WalletContext";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Bank {
  name: string;
  code: string;
  id: number;
}

interface SavedBankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
}

type WithdrawStep = "form" | "otp" | "success";

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { walletData, refreshWallet } = useWallet();
  const userSession = getUserSession();

  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [saveAccount, setSaveAccount] = useState(false);

  const [useSavedAccount, setUseSavedAccount] = useState(false);
  const [selectedSavedAccountId, setSelectedSavedAccountId] = useState("");

  const [banks, setBanks] = useState<Bank[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]);

  const [step, setStep] = useState<WithdrawStep>("form");
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [error, setError] = useState("");
  const [successAmount, setSuccessAmount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchBanks();
      fetchSavedAccounts();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBankCode && !useSavedAccount) {
      resolveAccountName();
    } else if (accountNumber.length !== 10) {
      setResolvedAccountName("");
    }
  }, [accountNumber, selectedBankCode]);

  const resetForm = () => {
    setAmount("");
    setSelectedBank("");
    setSelectedBankCode("");
    setAccountNumber("");
    setResolvedAccountName("");
    setSaveAccount(false);
    setUseSavedAccount(false);
    setSelectedSavedAccountId("");
    setStep("form");
    setOtpValue("");
    setError("");
  };

  const fetchBanks = async () => {
    try {
      const response = await api.getBanks();
      if (response.success && response.data) {
        setBanks(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch banks:", err);
    }
  };

  const fetchSavedAccounts = async () => {
    if (!userSession?.userId) return;
    try {
      const response = await api.getBankDetails(userSession.userId);
      if (response.success && response.data?.data) {
        setSavedAccounts(response.data.data);
      } else if (response.success && Array.isArray(response.data)) {
        setSavedAccounts(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch saved accounts:", err);
    }
  };

  const resolveAccountName = async () => {
    if (!accountNumber || !selectedBankCode) return;

    setResolvingAccount(true);
    setResolvedAccountName("");
    setError("");

    try {
      const response = await api.resolveAccount(
        accountNumber,
        selectedBankCode,
      );
      if (response.success && response.data?.data?.accountName) {
        setResolvedAccountName(response.data.data.accountName);
      } else {
        setError(response.data?.message || "Unable to resolve account name");
      }
    } catch (err) {
      console.error("Failed to resolve account:", err);
      setError("Unable to verify account. Please check the details.");
    } finally {
      setResolvingAccount(false);
    }
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bankName = e.target.value;
    setSelectedBank(bankName);
    const bank = banks.find((b) => b.name === bankName);
    setSelectedBankCode(bank?.code || "");
    setResolvedAccountName("");
  };

  const handleSavedAccountChange = (accountId: string) => {
    setSelectedSavedAccountId(accountId);
    const account = savedAccounts.find((a) => a.id === accountId);
    if (account) {
      setResolvedAccountName(account.accountName);
    }
  };

  const getSelectedBankAccountId = (): string => {
    if (useSavedAccount) {
      return selectedSavedAccountId;
    }
    return "";
  };

  const handleInitiateWithdrawal = async () => {
    if (!userSession?.userId) {
      setError("Please log in to continue");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (walletData && withdrawAmount > walletData.availableBalance) {
      setError("Insufficient balance");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let bankAccountId = getSelectedBankAccountId();

      if (!useSavedAccount) {
        if (!resolvedAccountName) {
          setError("Please wait for account verification");
          setLoading(false);
          return;
        }

        const bank = banks.find((b) => b.name === selectedBank);
        const addBankResponse = await api.addBankDetails(userSession.userId, {
          AccountNumber: accountNumber,
          BankName: selectedBank,
          BankCode: selectedBankCode,
          BankId: bank?.id?.toString() || "",
          BankType: "nuban",
          AccountName: resolvedAccountName,
          IsActive: true,
        });

        if (!addBankResponse.success) {
          setError(
            addBankResponse.data?.message || "Failed to save bank details",
          );
          setLoading(false);
          return;
        }

        bankAccountId =
          addBankResponse.data?.data?.id || addBankResponse.data?.id;
      }

      if (!bankAccountId) {
        setError("Please select or add a bank account");
        setLoading(false);
        return;
      }

      const response = await api.initiateWithdrawal(userSession.userId, {
        Amount: withdrawAmount,
        BankAccountId: bankAccountId,
        Reason: "Wallet withdrawal",
        Currency: "Naira",
        Device: navigator.userAgent,
      });

      if (response.success) {
        setSuccessAmount(withdrawAmount);
        setStep("otp");
      } else {
        setError(response.data?.message || "Failed to initiate withdrawal");
      }
    } catch (err) {
      console.error("Withdrawal initiation failed:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmWithdrawal = async () => {
    if (!userSession?.userId) {
      setError("Please log in to continue");
      return;
    }

    if (!otpValue || otpValue.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bankAccountId = useSavedAccount
        ? selectedSavedAccountId
        : savedAccounts[savedAccounts.length - 1]?.id; // Get the newly added account

      const response = await api.confirmWithdrawal(
        userSession.userId,
        otpValue,
        {
          Amount: successAmount,
          BankAccountId: bankAccountId,
          Reason: "Wallet withdrawal",
          Currency: "Naira",
          Device: navigator.userAgent,
        },
      );

      if (response.success) {
        setStep("success");
        refreshWallet();
      } else {
        setError(response.data?.message || "Invalid verification code");
      }
    } catch (err) {
      console.error("Withdrawal confirmation failed:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) return false;
    if (walletData && withdrawAmount > walletData.availableBalance)
      return false;

    if (useSavedAccount) {
      return !!selectedSavedAccountId;
    } else {
      return (
        !!selectedBank && accountNumber.length === 10 && !!resolvedAccountName
      );
    }
  };

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString()}`;
  };

  if (!isOpen) return null;

  if (step === "success") {
    return (
      <WithdrawSuccessModal
        isOpen={true}
        onClose={() => {
          resetForm();
          onClose();
        }}
        amount={successAmount}
        accountName={
          resolvedAccountName ||
          savedAccounts.find((a) => a.id === selectedSavedAccountId)
            ?.accountName ||
          ""
        }
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <DashboardNavbar />

      {/* Back Button */}
      <button
        onClick={() => {
          if (step === "otp") {
            setStep("form");
            setOtpValue("");
            setError("");
          } else {
            onClose();
          }
        }}
        className="cursor-pointer mt-6 ml-6 md:ml-24 mb-4"
      >
        <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
      </button>

      <div className="max-w-2xl mx-auto px-6 md:px-10 py-4 flex flex-col gap-10">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">
            {step === "otp" ? "Verify withdrawal" : "Withdraw funds"}
          </h2>
          <p className="text-gray-700 mt-1">
            {step === "otp"
              ? "Enter the 6-digit code sent to your email"
              : "Withdraw your available balance securely to your bank account"}
          </p>
          {walletData && step === "form" && (
            <p className="text-sm text-gray-500 mt-2">
              Available balance:{" "}
              <span className="font-semibold text-[#810306]">
                {formatCurrency(walletData.availableBalance)}
              </span>
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
            {error}
          </div>
        )}

        {step === "form" ? (
          /* Withdrawal Form */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInitiateWithdrawal();
            }}
            className="flex flex-col gap-6"
          >
            {/* Enter Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm text-gray-800 mb-1"
              >
                Enter amount
              </label>
              <div className="flex items-center border border-[#ABADB2] rounded-sm px-3 py-2 gap-3">
                <div className="flex items-center gap-2 border border-[#ABADB2] rounded-sm px-2 py-1">
                  <Image
                    src="/naijaFlag.svg"
                    alt="NGN"
                    width={20}
                    height={20}
                  />
                  <p className="text-sm">NGN</p>
                </div>
                <input
                  type="number"
                  id="amount"
                  placeholder="Enter amount"
                  className="w-full border-none focus:outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  max={walletData?.availableBalance || undefined}
                />
              </div>
              {walletData &&
                parseFloat(amount) > walletData.availableBalance && (
                  <p className="text-red-500 text-xs mt-1">
                    Amount exceeds available balance
                  </p>
                )}
            </div>

            {/* Account Selection Toggle */}
            {savedAccounts.length > 0 && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setUseSavedAccount(false)}
                  className={`px-4 py-2 rounded-sm text-sm transition ${
                    !useSavedAccount
                      ? "bg-[#810306] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  New Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => setUseSavedAccount(true)}
                  className={`px-4 py-2 rounded-sm text-sm transition ${
                    useSavedAccount
                      ? "bg-[#810306] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Saved Accounts ({savedAccounts.length})
                </button>
              </div>
            )}

            {useSavedAccount ? (
              /* Saved Accounts Selection */
              <div className="flex flex-col gap-3">
                <label className="block text-sm text-gray-800">
                  Select account
                </label>
                {savedAccounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => handleSavedAccountChange(account.id)}
                    className={`p-4 border rounded-sm cursor-pointer transition ${
                      selectedSavedAccountId === account.id
                        ? "border-[#810306] bg-red-50"
                        : "border-[#ABADB2] hover:border-gray-400"
                    }`}
                  >
                    <p className="font-medium">{account.accountName}</p>
                    <p className="text-sm text-gray-600">
                      {account.bankName} - {account.accountNumber}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              /* New Bank Account Form */
              <>
                {/* Bank Name */}
                <div className="relative">
                  <label
                    htmlFor="bank"
                    className="block text-sm text-gray-800 mb-1"
                  >
                    Bank name
                  </label>
                  <select
                    id="bank"
                    value={selectedBank}
                    onChange={handleBankChange}
                    className="border border-[#ABADB2] p-2 w-full rounded-sm focus:outline-none appearance-none"
                    required
                    disabled={banks.length === 0}
                  >
                    <option value="">
                      {banks.length === 0 ? "Loading banks..." : "Select bank"}
                    </option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
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
                    type="text"
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setAccountNumber(value);
                    }}
                    className="border border-[#ABADB2] p-2 w-full rounded-sm focus:outline-none"
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                  />

                  {/* Account Name Resolution */}
                  {resolvingAccount && (
                    <p className="text-sm text-gray-500 mt-1">
                      Verifying account...
                    </p>
                  )}
                  {resolvedAccountName && !resolvingAccount && (
                    <p className="text-sm text-right mt-1 font-medium text-green-700">
                      {resolvedAccountName}
                    </p>
                  )}
                </div>

                {/* Save Bank Checkbox */}
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={saveAccount}
                    onChange={(e) => setSaveAccount(e.target.checked)}
                    className="accent-[#810306] h-4 w-4 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Save this bank account for future payouts
                  </span>
                </label>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`w-full px-4 py-2 rounded-sm transition ${
                isFormValid() && !loading
                  ? "bg-[#810306] text-white cursor-pointer hover:bg-[#810306]/70"
                  : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
              }`}
            >
              {loading ? "Processing..." : "Continue"}
            </button>
          </form>
        ) : (
          /* OTP Verification Form */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmWithdrawal();
            }}
            className="flex flex-col gap-6"
          >
            <div className="bg-gray-50 p-4 rounded-sm">
              <p className="text-sm text-gray-600">Withdrawal amount</p>
              <p className="text-2xl font-semibold text-[#810306]">
                {formatCurrency(successAmount)}
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm text-gray-800 mb-1">
                Verification code
              </label>
              <input
                type="text"
                id="otp"
                value={otpValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtpValue(value);
                }}
                className="border border-[#ABADB2] p-3 w-full rounded-sm focus:outline-none text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the 6-digit code sent to your email address
              </p>
            </div>

            <button
              type="submit"
              disabled={otpValue.length !== 6 || loading}
              className={`w-full px-4 py-2 rounded-sm transition ${
                otpValue.length === 6 && !loading
                  ? "bg-[#810306] text-white cursor-pointer hover:bg-[#810306]/70"
                  : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
              }`}
            >
              {loading ? "Verifying..." : "Confirm Withdrawal"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
