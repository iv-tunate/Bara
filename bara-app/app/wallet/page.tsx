"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import WithdrawFunds from "@/components/WithdrawFunds";
import Pagination from "@/components/Pagination";
import { getUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";
import { Transaction } from "@/models/transaction";
import PaymentLogo from "@/components/PaymentLogo";
import { usePageGuard } from "@/app/hooks/usepageguard";

import { useWallet } from "@/context/WalletContext";

interface WalletData {
  availableBalance: number;
  totalBalance: number;
  lockedBalance: number;
  currencySymbol: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  
  const { walletData, refreshWallet, isLoading: walletLoading } = useWallet();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const userSession = getUserSession();
  usePageGuard();

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userSession?.userId) {
        setError("User session not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const transactionsResponse = await api.getUserTransactions(
          userSession.userId,
          currentPage,
          pageSize
        );

        if (transactionsResponse.success && transactionsResponse.data) {
          const responseData = transactionsResponse.data;

          const transactionsList = Array.isArray(responseData)
            ? responseData
            : responseData.data && Array.isArray(responseData.data)
            ? responseData.data
            : [];

          setTransactions(transactionsList);

          const totalCount =
            responseData.totalCount || responseData.totalRecords || 0;
          setTotalPages(Math.ceil(totalCount / pageSize));
        } else {
          setError(
            transactionsResponse.message || "Failed to fetch transactions"
          );
        }
      } catch (err) {
        setError("An error occurred while fetching wallet data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userSession?.userId, currentPage]);

  const formatCurrency = (amount: number, symbol: string = "₦") => {
    return `${symbol}${Number(amount || 0).toLocaleString()}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) {
      return `Today | ${timeString}`;
    }

    const dateFormatted = date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");

    return `${dateFormatted} | ${timeString}`;
  };

  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (
      statusLower === "successful" ||
      statusLower === "success" ||
      statusLower === "completed"
    ) {
      return "bg-[#C3E8BF] border-[#0DA500] text-[#0DA500]";
    }
    if (statusLower === "failed" || statusLower === "failure") {
      return "bg-[#FFBFBF] border-[#FF0000] text-[#FF0000]";
    }
    return "bg-gray-200 border-gray-500 text-gray-500";
  };

  const getAmountClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (
      statusLower === "successful" ||
      statusLower === "success" ||
      statusLower === "completed"
    ) {
      return "text-[#0DA500]";
    }
    if (statusLower === "failed" || statusLower === "failure") {
      return "text-[#FF0000]";
    }
    return "text-gray-500";
  };

  const getDisplayStatus = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "success" || statusLower === "completed") {
      return "Successful";
    }
    if (statusLower === "failure") {
      return "Failed";
    }
    return status;
  };

  const totalWithdrawn = transactions
    .filter(
      (t) =>
        t.transactionType.toLowerCase().includes("withdrawal") &&
        (t.status.toLowerCase() === "successful" ||
          t.status.toLowerCase() === "success" ||
          t.status.toLowerCase() === "completed")
    )
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-2xl mx-auto px-4 md:px-10 lg:px-10 py-4 flex flex-col gap-10">
        <h2 className="text-xl font-semibold">Bara wallet</h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">Loading wallet data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <div className="flex flex-col items-left justify-start bg-[#FFEDEE] bg-[url('/whisk-bg.png')] bg-contain bg-no-repeat bg-right py-5 px-7 rounded-md gap-10">
              <div className=" flex flex-row gap-3 items-center relative group">
                <Image src="/Money.svg" alt="Close" width={20} height={20} />
                <p className="font-semibold">Available Balance</p>
                <div className="group-hover:block hidden absolute z-10 p-2 bg-gray-800 text-white text-xs rounded-md -top-10 left-0 w-48 shadow-lg">
                  Funds you can currently withdraw or spend.
                </div>
                <span className="text-gray-400 cursor-help text-xs items-center justify-center flex border rounded-full w-4 h-4">
                  ?
                </span>
              </div>
              <h2 className="font-semibold text-2xl">
                {walletData
                  ? formatCurrency(
                      walletData.availableBalance,
                      walletData.currencySymbol
                    )
                  : "NGN 0.00"}
              </h2>
              <div className="flex gap-4">
                {/* Fund Wallet Button (Available to Everyone) */}
                <button
                  onClick={() => router.push("/wallet/fund")}
                  className="rounded-md bg-[#810306] px-4 py-2 text-white hover:bg-red-800 w-fit cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
                >
                  Fund Wallet
                </button>

                {/* Withdraw Button (Available to Everyone) */}
                <button
                  onClick={() => setWithdrawModalOpen(true)}
                  className="rounded-md border border-[#810306] text-[#810306] px-4 py-2 hover:bg-red-50 w-fit cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
                >
                  Withdraw Funds
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Balance */}
              <div className="bg-white  border-2 border-gray-800/20 rounded-xl p-4 flex flex-col gap-3 relative group">
                <div className=" flex flex-row gap-3 items-center">
                  <p className="text-md font-medium">Total Balance</p>
                  <div className="group-hover:block hidden absolute z-10 p-2 bg-gray-800 text-white text-xs rounded-md -top-10 left-0 w-48 shadow-lg">
                    The sum of your Available and Locked funds.
                  </div>
                  <span className="text-gray-400 cursor-help text-xs items-center justify-center flex border rounded-full w-4 h-4">
                    ?
                  </span>
                </div>
                <p className="text-xl font-semibold">
                  {walletData
                    ? formatCurrency(
                        walletData.totalBalance,
                        walletData.currencySymbol
                      )
                    : "NGN 0.00"}
                </p>
              </div>

              {/* Locked Balance */}
              <div className="bg-white  border-2 border-gray-800/20 rounded-xl p-4 flex flex-col gap-3 relative group">
                <div className=" flex flex-row gap-3 items-center">
                  <p className="text-md font-medium">Locked Balance</p>
                  <div className="group-hover:block hidden absolute z-10 p-2 bg-gray-800 text-white text-xs rounded-md -top-10 left-0 w-48 shadow-lg">
                    Funds held in escrow for active scripts/transactions.
                  </div>
                  <span className="text-gray-400 cursor-help text-xs items-center justify-center flex border rounded-full w-4 h-4">
                    ?
                  </span>
                </div>
                <p className="text-xl font-semibold">
                  {walletData
                    ? formatCurrency(
                        walletData.lockedBalance,
                        walletData.currencySymbol
                      )
                    : "NGN 0.00"}
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <h2 className="text-2xl font-semibold">Recent Transactions</h2>

            {transactions.length === 0 ? (
              <div className="flex items-center justify-center py-10 border border-gray-800/20 rounded-md">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 -mt-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-5 border border-gray-800/20 rounded-md px-5 py-3"
                    >
                      <div className="flex flex-row justify-between gap-5">
                        <div className="flex flex-row gap-5">
                          <PaymentLogo
                            method={transaction.paymentMethod}
                            type={transaction.transactionType}
                          />
                          <div>
                            <p
                              className={`text-xl font-semibold ${getAmountClass(
                                transaction.status
                              )}`}
                            >
                              {formatCurrency(
                                transaction.amount,
                                transaction.currencySymbol
                              )}
                            </p>
                            <p className="text-sm">
                              {transaction.transactionType}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-xs font-medium px-3 py-1 rounded-sm border ${getStatusClass(
                              transaction.status
                            )}`}
                          >
                            {getDisplayStatus(transaction.status)}
                          </div>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex flex-row justify-between text-[10px]">
                        <p>
                          {formatDateTime(
                            transaction.transactionDate ||
                              transaction.createdAt ||
                              ""
                          )}
                        </p>
                        <p>Ref: {transaction.referenceId || "N/A"}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      <WithdrawFunds
        isOpen={isWithdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
      />
    </main>
  );
}
