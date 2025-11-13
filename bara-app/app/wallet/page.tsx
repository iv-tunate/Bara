"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";

export default function WalletPage() {
  const transactions = [
    {
      id: 1,
      amount: "NGN 250,000",
      status: "Successful",
      dateTime: "Today | 02:46pm",
      ref: "TXN-20250912-8391",
      description: "Payment received for the waiters dream",
      avatar: "/profilePic.png",
    },
    {
      id: 2,
      amount: "NGN 250,000",
      status: "Successful",
      dateTime: "30.08.2025 | 02:45pm",
      ref: "TXN-20250912-8392",
      description: "Withdrawal successfully completed",
      avatar: "/profilePic.png",
    },
    {
      id: 3,
      amount: "NGN 250,000",
      status: "Failed",
      dateTime: "30.08.2025 | 02:45pm",
      ref: "TXN-20250912-8393",
      description: "₦250,000 withdrawal to GTBank failed. Please try again.",
      avatar: "/profilePic.png",
    },
    {
      id: 4,
      amount: "NGN 250,000",
      status: "Failed",
      dateTime: "30.08.2025 | 02:44pm",
      ref: "TXN-20250912-8394",
      description: "₦250,000 withdrawal to GTBank failed. Please try again.",
      avatar: "/profilePic.png",
    },
  ];

  const statusClasses: { [key: string]: string } = {
    Successful: "bg-[#C3E8BF] border-[#0DA500] text-[#0DA500]",
    Failed: "bg-[#FFBFBF] border-[#FF0000] text-[#FF0000]",
  };

  const amountClasses: { [key: string]: string } = {
    Successful: "text-[#0DA500]",
    Failed: "text-[#FF0000]",
  };

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-4xl mx-auto px-4 md:px-10 lg:px-10 py-4 flex flex-col gap-10">
        <h2 className="text-4xl font-semibold">Bara Wallet</h2>

        {/* Balance Card */}
        <div className="flex flex-col items-left justify-start  bg-[#FFEDEE] bg-[url('/whisk-bg.png')] bg-contain bg-no-repeat bg-right py-5 px-7 rounded-md gap-10">
          <div className=" flex flex-row gap-3">
            <Image src="/Money.svg" alt="Close" width={20} height={20} />
            <p className="font-semibold">Available Balance</p>
          </div>
          <h2 className="font-semibold text-4xl">NGN 600,000,000.00</h2>
          <Link href="/wallet">
            <button className="rounded-md bg-[#810306] px-4 py-2 text-white hover:bg-[#810306]/70 transition">
              Withdraw Funds
            </button>
          </Link>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total earnings */}
          <div className="bg-white border border-2 border-gray-800/20 rounded-xl p-4 flex flex-col gap-3">
            <div className=" flex flex-row gap-3">
              <Image src="/Money.svg" alt="arrow" width={20} height={20} />
              <p className="text-lg">Total Earnings so far</p>
            </div>
            <p className="text-2xl font-semibold">NGN 2, 000, 000.00</p>
          </div>

          {/* Amount withdrawn */}
          <div className="bg-white border border-2 border-gray-800/20 rounded-xl p-4 flex flex-col gap-3">
            <div className=" flex flex-row gap-3">
              <img src="/lock.png" alt="lock" className="w-5 h-5" />
              <p className="text-lg">Amount withdrawn</p>
            </div>
            <p className="text-2xl font-semibold">NGN 2, 000, 000.00</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <h2 className="text-2xl font-semibold">Recent Transactions</h2>

        <div className="flex flex-col gap-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-5 border border-gray-800/20 rounded-md px-5 py-3"
            >
              <div className="flex flex-row justify-between gap-5">
                <div className="flex flex-row gap-5">
                  <img
                    src={transaction.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p
                      className={`text-xl font-semibold ${
                        amountClasses[transaction.status] || "bg-neutral-800"
                      }`}
                    >
                      {transaction.amount}
                    </p>
                    <p className="text-sm">{transaction.description}</p>
                  </div>
                </div>
                <div>
                  <button
                    className={`text-xs font-medium px-3 py-1 rounded-sm border ${
                      statusClasses[transaction.status] || "bg-neutral-800"
                    }`}
                  >
                    {transaction.status}
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex flex-row justify-between text-xs">
                <p>{transaction.dateTime}</p>
                <p>{transaction.ref}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
