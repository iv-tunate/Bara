"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type NotificationStatus = "read" | "unread";

interface Notification {
  id: string;
  message: string;
  category: string;
  date: string;
  time: string;
  status: NotificationStatus;
  pin: boolean;
  showWallet: boolean;
  fullDate: Date;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNotificationId, setOpenNotificationId] = useState<string | null>(
    null
  );

  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const session = getUserSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const res = await api.getNotifications(page, pageSize);
        if (res.success && res.data && res.data.data) {
          const rawList = res.data.data || res.data;
          const list = Array.isArray(rawList) ? rawList : rawList.Data || [];

          const mapped: Notification[] = list.map((n: any) => ({
            id: n.id,
            message: n.message,
            category: n.title,
            date: dayjs(n.date).format("Do MMMM, YYYY"),
            time: dayjs(n.date).format("h:mm a"),
            status: n.isRead ? "read" : "unread",
            pin: false,
            showWallet: n.type === "wallet",
            fullDate: new Date(n.date),
          }));
          setNotifications(mapped);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page]);

  const handleNext = () => setPage((p) => p + 1);
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));

  const statusClasses: { [key: string]: string } = {
    read: "bg-white",
    unread: "bg-[#F5F5F5]",
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardNavbar />

      <div className="py-3 w-full max-w-4xl mx-auto px-4">
        <div className="flex flex-row justify-between items-center mb-7 mt-5">
          <h3 className="text-2xl font-bold">Notifications</h3>

          {notifications.length > 0 && (
            <div className="flex gap-10 justify-end items-center">
              {/* <Link href="/notifications">
                <p className="text-[#810306] font-semibold">Mark all as read</p>
              </Link> */}
              <div className="flex gap-3 items-center">
                <p className="text-gray-600">Filter</p>
                <div className="relative">
                  <select
                    name="categories"
                    id="categories"
                    className="outline-none border border-[#ABADB2] rounded-sm appearance-none cursor-pointer pl-2 pr-8 py-1 bg-white"
                  >
                    <option value="All">All</option>
                    <option value="Payment">Payments</option>
                    <option value="Messages">Messages</option>
                    <option value="Script">Script Activity</option>
                  </select>
                  <Image
                    className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
                    src="/dropdown.png"
                    alt="dropdown"
                    width={10}
                    height={10}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#810306]"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">No details yet.</p>
            <p className="text-sm mt-2">
              Real-time alerts will appear here if you have any.
            </p>
          </div>
        ) : (
          <>
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 flex flex-col gap-2 rounded-sm mb-2 border border-gray-100 ${
                    statusClasses[notification.status] || "bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-xs bg-[#FFD9BF] w-max px-2 py-0.5 rounded-sm border border-[#BF4E00] text-[#BF4E00] font-medium">
                      {notification.category}
                    </p>
                    <div className="flex gap-3 items-center">
                      {notification.showWallet && (
                        <Link href="/wallet">
                          <p className="text-[#BF0000] text-sm hover:underline">
                            View wallet
                          </p>
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
                          className="hover:text-[#800000] flex items-center gap-1 cursor-pointer p-1"
                        >
                          <Image
                            src="/others.svg"
                            alt="options"
                            width={16}
                            height={4}
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
                  <p className="text-md font-medium text-[#22242A]">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {notification.date} • {notification.time}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-row items-center gap-1 mt-6 justify-center">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="flex gap-3 border border-[#ABADB2] px-2 py-1 rounded-sm items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <Image
                  src="/Arrow-left.svg"
                  alt="prev"
                  width={18}
                  height={18}
                />
                <p>Prev</p>
              </button>

              <div className="flex flex-row items-center gap-1 text-[#333740] mx-2">
                <button className="bg-[#810306] border border-[#810306] text-white px-3 py-1 rounded-sm">
                  {page}
                </button>
              </div>

              <button
                onClick={handleNext}
                className="flex gap-3 border border-[#ABADB2] px-2 py-1 rounded-sm items-center hover:bg-gray-50"
              >
                <p>Next</p>
                <Image
                  src="/Arrow-right.svg"
                  alt="next"
                  width={18}
                  height={18}
                />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
