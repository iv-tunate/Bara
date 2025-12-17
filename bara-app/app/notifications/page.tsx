"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";
import { format } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Placeholder until backend API is inspected/created for getting list of notifications
      // The backend has SignalR for *new* ones, but does it have an endpoint for *past* ones?
      // I didn't see a NotificationController.
      // I will assume for now we might not have persistent notifications endpoint yet,
      // or I'll implement a basic UI that listens to SignalR for now if API is missing.
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DashboardNavbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-[#22242A]">
          Notifications
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No notifications yet.</p>
            <p className="text-sm mt-2">
              Real-time alerts will appear here while you are online.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n, i) => (
              <li key={i} className="p-4 border rounded hover:bg-gray-50">
                {/* Notification Item */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
