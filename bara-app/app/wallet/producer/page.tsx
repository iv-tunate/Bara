"use client";

import { useState } from "react";
import Image from "next/image";
import DashboardNavbar from "@/components/DashboardNavbar";
import FundProducer from "@/components/FundProducer";
// import { getUserSession } from "@/utils/tokenManager";
// import { usePageGuard } from "@/app/hooks/usepageguard";

export default function WalletPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  // const userSession = getUserSession();
  // usePageGuard();
  
  // const user = {
  //   name: userSession?.name,
  //   email: userSession?.email,
  //   userId: userSession?.userId,
  //   profileStatus: userSession?.profileComplete,
  // };
  const transactions = [
    {
      id: 1,
      amount: "NGN 250,000",
      status: "Successful",
      recepient: "The waiters Dream",
      dateTime: "Today | 02:46pm",
      ref: "Ref: TXN-20250912-8391",
      description: "Payment received for ",
      avatar: "/profilePic.png",
    },
    {
      id: 2,
      amount: "NGN 250,000",
      status: "Successful",
      recepient: "",
      dateTime: "30.08.2025 | 02:45pm",
      ref: "Ref: TXN-20250912-8392",
      description: "Withdrawal successfully completed",
      avatar: "/profilePic.png",
    },
    {
      id: 3,
      amount: "NGN 250,000",
      status: "Failed",
      recepient: "",
      dateTime: "30.08.2025 | 02:45pm",
      ref: "Ref: TXN-20250912-8393",
      description: "₦250,000 withdrawal to GTBank failed. Please try again.",
      avatar: "/profilePic.png",
    },
    {
      id: 4,
      amount: "NGN 250,000",
      status: "Failed",
      recepient: "",
      dateTime: "30.08.2025 | 02:44pm",
      ref: "Ref: TXN-20250912-8394",
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

      <div className="max-w-2xl mx-auto px-4 md:px-10 lg:px-10 py-4 flex flex-col gap-10">
        <h2 className="text-xl font-semibold">Bara wallet</h2>

        {/* Balance Card */}
        <div className="flex flex-col items-left justify-start bg-[#FFEDEE] bg-[url('/whisk-bg.png')] bg-contain bg-no-repeat bg-right py-5 px-7 rounded-md gap-10">
          <div className=" flex flex-row gap-3">
            <Image src="/Money.svg" alt="Close" width={20} height={20} />
            <p className="font-semibold">Available Balance</p>
          </div>
          <h2 className="font-semibold text-2xl">NGN 600,000.00</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-[#810306] px-4 py-2 text-white hover:bg-red-800 w-fit cursor-pointer transition-all duration-300 ease-in-out
              hover:scale-105"
          >
            Fund Wallet
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total earnings */}
          <div className="bg-white  border-2 border-gray-800/20 rounded-xl p-4 flex flex-col gap-3">
            <div className=" flex flex-row gap-3">
              {/* <Image src="/earned-arrow.svg" alt="arrow" width={20} height={20} /> */}
              <p className="text-md font-medium">Total earnings so far</p>
            </div>
            <p className="text-xl font-semibold">NGN 2, 018, 500.00</p>
          </div>

          {/* Amount withdrawn */}
          <div className="bg-white  border-2 border-gray-800/20 rounded-xl p-4 flex flex-col gap-3">
            <div className=" flex flex-row gap-3">
              {/* <img src="/Lock_light.svg" alt="lock" width={20} height={20} /> */}
              <p className="text-md font-medium">Amount withdrawn</p>
            </div>
            <p className="text-xl font-semibold">NGN 230, 000.00</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <h2 className="text-2xl font-semibold">Recent Transactions</h2>

        <div className="flex flex-col gap-3 -mt-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-5 border border-gray-800/20 rounded-md px-5 py-3"
            >
              <div className="flex flex-row justify-between gap-5">
                <div className="flex flex-row gap-5">
                  <Image
                    src={transaction.avatar}
                    alt="avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p
                      className={`text-xl font-semibold ${
                        amountClasses[transaction.status] || "bg-neutral-800"
                      }`}
                    >
                      {transaction.amount}
                    </p>
                    <p className="text-sm">
                      {transaction.description}
                      <b>{transaction.recepient}</b>
                    </p>
                  </div>
                </div>
                <div>
                  <div
                    className={`text-xs font-medium px-3 py-1 rounded-sm border ${
                      statusClasses[transaction.status] || "bg-neutral-800"
                    }`}
                  >
                    {transaction.status}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex flex-row justify-between text-[10px]">
                <p>{transaction.dateTime}</p>
                <p>{transaction.ref}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Withdraw Modal */}
      <FundProducer isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
