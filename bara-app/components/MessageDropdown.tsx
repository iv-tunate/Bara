"use client";

import Link from "next/link";

export interface MessageDropdownProps {
  onClose: () => void;
}

export default function MessageDropdown({ onClose }: MessageDropdownProps) {
  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
      <Link
        href="/chat"
        onClick={onClose}
        className="block px-4 py-2 hover:bg-gray-100"
      >
        Chat
      </Link>
      <Link
        href="/notifications"
        onClick={onClose}
        className="block px-4 py-2 hover:bg-gray-100"
      >
        Notifications
      </Link>
    </div>
  );
}
