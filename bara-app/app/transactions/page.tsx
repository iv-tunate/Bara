"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";

interface Transaction {
  id: string;
  amount: number;
  currencySymbol: string;
  status: string;
  transactionType: string;
  reference: string;
  createdAt: string;
  completedAt?: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    loadTransactions(session.userId, currentPage);
  }, [router, currentPage]);

  const loadTransactions = async (userId: string, page: number) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.getUserTransactions(userId, page, pageSize);
      
      if (response.success && response.data) {
        setTransactions(response.data);
        setTotalPages(Math.ceil((response.totalCount || 0) / pageSize));
      } else {
        setError(response.message || "Failed to load transactions");
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      setError("An error occurred while loading transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "initiated":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case "WalletFunding":
        return "Wallet Funding";
      case "ScriptPurchase":
        return "Script Purchase";
      case "Withdrawal":
        return "Withdrawal";
      case "Refund":
        return "Refund";
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number, symbol: string) => {
    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#22242A]">Transaction History</h1>
          <p className="text-gray-600 mt-1">View all your payment transactions and wallet activities</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500">Your transaction history will appear here once you start making payments</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(transaction.createdAt)}
                            </div>
                            {transaction.completedAt && (
                              <div className="text-xs text-gray-500">
                                Completed: {formatDate(transaction.completedAt)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-900">
                            {getTransactionTypeDisplay(transaction.transactionType)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(transaction.amount, transaction.currencySymbol)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs text-gray-500 font-mono">
                            {transaction.reference}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 border-b last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {getTransactionTypeDisplay(transaction.transactionType)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(transaction.amount, transaction.currencySymbol)}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {transaction.reference}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
