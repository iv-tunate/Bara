"use client";

import Link from "next/link";

export interface NotificationsDropdownProps {
  onClose: () => void;
  notificationStatus: "read" | "unread";
}

export default function NotificationsDropdown({
  onClose,
  notificationStatus,
}: NotificationsDropdownProps) {
  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 -mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
      <Link
        href="/notifications"
        onClick={onClose}
        className="block px-4 py-1 hover:bg-gray-100"
      >
        Pin notification
      </Link>
      {notificationStatus === "read" && (
        <Link
          href="/notifications"
          onClick={onClose}
          className="block px-4 py-1 hover:bg-gray-100"
        >
          Mark as unread
        </Link>
      )}
      <Link
        href="/notifications"
        onClick={onClose}
        className="block px-4 py-1 hover:bg-gray-100 text-[#FF0000] text-md"
      >
        Delete
      </Link>
    </div>
  );
}
