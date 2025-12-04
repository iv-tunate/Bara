"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import Pagination from "@/components/Pagination";

type NotificationStatus = "read" | "unread";

interface Notification {
  id: number;
  message: string;
  category: string;
  date: string;
  time: string;
  status: NotificationStatus;
  pin: boolean;
  showWallet: boolean;
}

export default function NotificationPage() {
  const [openNotificationId, setOpenNotificationId] = useState<number | null>(
    null
  );

  const notifications: Notification[] = [
    {
      id: 1,
      message: "₦250,000 from ‘Land of Mira’ released to your wallet.",
      category: "Payment",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "unread",
      pin: true,
      showWallet: true,
    },
    {
      id: 2,
      message: "Producer approved ‘The Waiter’s Dream.’ Payment finalized.",
      category: "Script Confirmation",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "unread",
      pin: false,
      showWallet: true,
    },
    {
      id: 3,
      message: "You have a new message from Ada Jones (Producer).",
      category: "New Message",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "unread",
      pin: false,
      showWallet: true,
    },
    {
      id: 4,
      message: "Molayo Lee left you a comment on your script - Born to rule",
      category: "New Comment",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "read",
      pin: false,
      showWallet: true,
    },
    {
      id: 5,
      message:
        "Producer Ada Jones started reviewing Broken Secret. You’ll be notified when feedback is added.",
      category: "Script Activity",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "read",
      pin: false,
      showWallet: false,
    },
    {
      id: 6,
      message:
        "Withdrawal of ₦150,000 to GTBank (••••1234) completed successfully.",
      category: "Withdrawal",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "read",
      pin: false,
      showWallet: true,
    },
    {
      id: 7,
      message:
        "Producer requested a refund for Land of Mira. Payment placed on hold.",
      category: "Refunds and disputes",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "read",
      pin: false,
      showWallet: false,
    },
    {
      id: 8,
      message: "Your payment method was updated successfully.",
      category: "Accounts and Profile",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "read",
      pin: false,
      showWallet: false,
    },
    {
      id: 9,
      message:
        "We’ve updated our Terms and Conditions to improve copyright protection.",
      category: "System Updates",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "read",
      pin: false,
      showWallet: true,
    },
    {
      id: 10,
      message:
        "Remember to update your bio and recent works. More visibility means more opportunities.",
      category: "Reminder",
      date: "24th October, 2025",
      time: "12:22pm",
      status: "read",
      pin: false,
      showWallet: true,
    },
  ];

  const statusClasses: { [key: string]: string } = {
    read: "bg-white",
    unread: "bg-[#F5F5F5]",
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardNavbar />

      <div className="py-3 w-full max-w-4xl mx-30">
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-7 mt-5">
          <h3 className="text-2xl">Notifications</h3>
          <div className="flex gap-10 justify-end items-center">
            <Link href={"/notifications"}>
              <p className="text-[#810306] font-semibold">Mark all as read</p>
            </Link>
            <div className="flex gap-3 items-center">
              <p>Filter</p>
              <select
                name="categories"
                id="categories"
                className="outline-none hover:outline-none border border-[#ABADB2] rounded-sm"
              >
                <option defaultValue={"All"}>All</option>
                <option value="Payment and others">Payment and wallet</option>
                <option value="Messages">Messages</option>
                <option value="Comments">Comments</option>
                <option value="Script Activity">Script Activity</option>
                <option value="Refunds and Disputes">
                  Refunds and Disputes
                </option>
                <option value="Accounts and Profile">
                  Accounts and Profile
                </option>
                <option value="Reminders">Reminders</option>
                <option value="Reminders">System Updates</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Container */}
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 flex flex-col gap-2 rounded-sm mb-2 ${
                statusClasses[notification.status] || "bg-[#F5F5F5]"
              }`}
            >
              <div className="flex flex-row items-center justify-between">
                <p className="text-sm bg-[#FFBFBF] w-max px-1 rounded-sm border border-[#BF0000]">
                  {notification.category}
                </p>
                <div className="flex gap-3 items-center">
                  {notification.pin && (
                    <Image
                      src="/Pin.svg"
                      alt="pin icon"
                      width={18}
                      height={18}
                    />
                  )}
                  {notification.showWallet && (
                    <Link href={"/wallet"}>
                      <p className="text-[#BF0000] text-sm">View wallet</p>
                    </Link>
                  )}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenNotificationId(
                          openNotificationId === notification.id
                            ? null
                            : notification.id
                        )
                      }
                      className="hover:text-[#800000] flex items-center gap-1 cursor-pointer"
                    >
                      <Image
                        src="/others.svg"
                        alt="other options"
                        width={3}
                        height={3}
                      />
                    </button>
                    {openNotificationId === notification.id && (
                      <NotificationsDropdown
                        onClose={() => setOpenNotificationId(null)}
                        notificationStatus={notification.status}
                      />
                    )}
                  </div>
                </div>
              </div>
              <p className="text-md max-w-md">{notification.message}</p>
              <p className="text-sm">
                {notification.date} || {notification.time}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-row items-center gap-1">
          <button className="flex gap-3 border border-[#ABADB2] px-2 py-1 rounded-sm items-center">
            <Image
              src="/Arrow-left.svg"
              alt="previous"
              width={18}
              height={18}
            />
            <p>Prev</p>
          </button>
          <div className="flex flex-row items-center gap-1 text-[#333740]">
            <button className="bg-[#810306] border border-[#810306] text-[#FFFFFF] px-3 py-1 rounded-sm items-center">
              1
            </button>
            <button className="border border-[#ABADB2] px-3 py-1 rounded-sm items-center">
              2
            </button>
            <button className="border border-[#ABADB2] px-3 py-1 rounded-sm items-center">
              3
            </button>
            <button className="border border-[#ABADB2] px-3 py-1 rounded-sm items-center">
              4
            </button>
            <button className="border border-[#ABADB2] px-3 py-1 rounded-sm items-center">
              ...
            </button>
          </div>
          <button className="flex gap-3 border border-[#ABADB2] px-2 py-1 rounded-sm items-center">
            <p>Next</p>
            <Image src="/Arrow-right.svg" alt="next" width={18} height={18} />
          </button>
        </div>
        {/* End of Pagination */}
      </div>
    </div>
  );
}
