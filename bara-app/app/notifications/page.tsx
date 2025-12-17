"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import NotificationsDropdown from "@/components/NotificationsDropdown";

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNotificationId, setOpenNotificationId] = useState<number | null>(null);

  // Simulated fetch for demonstration
  useEffect(() => {
    const fetchNotifications = async () => {
      await new Promise((res) => setTimeout(res, 800)); // simulate delay

      const fetchedNotifications: Notification[] = [
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
      ];

      setNotifications(fetchedNotifications);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const statusClasses: { [key: string]: string } = {
    read: "bg-white",
    unread: "bg-[#F5F5F5]",
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardNavbar />

      <div className="py-3 w-full max-w-4xl mx-auto px-4">
        <div className="flex flex-row justify-between items-center mb-7 mt-5">
          <h3 className="text-2xl">Notifications</h3>

          {notifications.length > 0 && (
            <div className="flex gap-10 justify-end items-center">
              <Link href="/notifications">
                <p className="text-[#810306] font-semibold">Mark all as read</p>
              </Link>
              <div className="flex gap-3 items-center">
                <p>Filter</p>
                <div className="relative">
                  <select
                    name="categories"
                    id="categories"
                    className="outline-none border border-[#ABADB2] rounded-sm appearance-none cursor-pointer pl-2"
                  >
                    <option value="All">All</option>
                    <option value="Payment and Wallet">Payment and Wallet</option>
                    <option value="Messages">Messages</option>
                    <option value="Comments">Comments</option>
                    <option value="Script Activity">Script Activity</option>
                    <option value="Refunds and Disputes">Refunds and Disputes</option>
                    <option value="Accounts and Profile">Accounts and Profile</option>
                    <option value="Reminders">Reminders</option>
                    <option value="System Updates">System Updates</option>
                  </select>
                  <Image
                    className="pointer-events-none absolute top-1 left-36"
                    src="/dropdown.png"
                    alt="dropdown"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">No notifications yet.</p>
            <p className="text-sm mt-2">
              Real-time alerts will appear here while you are online.
            </p>
          </div>
        ) : (
          <>
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 flex flex-col gap-2 rounded-sm mb-2 ${
                    statusClasses[notification.status] || "bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-xs bg-[#FFD9BF] w-max px-1 rounded-sm border border-[#BF4E00] text-[#BF4E00]">
                      {notification.category}
                    </p>
                    <div className="flex gap-3 items-center">
                      {notification.pin && (
                        <Image src="/Pin.svg" alt="pin" width={18} height={18} />
                      )}
                      {notification.showWallet && (
                        <Link href="/wallet">
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
                          <Image src="/others.svg" alt="options" width={3} height={3} />
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
            <div className="flex flex-row items-center gap-1 mt-6">
              <button className="flex gap-3 border border-[#ABADB2] px-2 py-1 rounded-sm items-center">
                <Image src="/Arrow-left.svg" alt="prev" width={18} height={18} />
                <p>Prev</p>
              </button>
              <div className="flex flex-row items-center gap-1 text-[#333740]">
                <button className="bg-[#810306] border border-[#810306] text-white px-3 py-1 rounded-sm">
                  1
                </button>
                <button className="border border-[#ABADB2] px-3 py-1 rounded-sm">2</button>
                <button className="border border-[#ABADB2] px-3 py-1 rounded-sm">3</button>
                <button className="border border-[#ABADB2] px-3 py-1 rounded-sm">4</button>
                <button className="border border-[#ABADB2] px-3 py-1 rounded-sm">...</button>
              </div>
              <button className="flex gap-3 border border-[#ABADB2] px-2 py-1 rounded-sm items-center">
                <p>Next</p>
                <Image src="/Arrow-right.svg" alt="next" width={18} height={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
