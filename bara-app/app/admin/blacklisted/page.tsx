"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import {
  Search,
  ChevronRight,
  User as UserIcon,
  Filter,
  MoreVertical,
  Calendar,
  AlertCircle,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Pagination from "@/components/Pagination";

export default function BlacklistedUsersPage() {
  const [blacklistedUsers, setBlacklistedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(25);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadBlacklistedUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getBlacklistedUsers(currentPage, pageSize);
      if (response.success && response.data) {
        const responseDetail = response.data;
        setBlacklistedUsers(responseDetail.data || []);
        setTotalPages(responseDetail.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load blacklisted users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlacklistedUsers();
  }, [currentPage, pageSize]);

  const handleRemoveFromBlacklist = async (userId: string) => {
    if (
      !confirm("Are you sure you want to remove this user from the blacklist?")
    )
      return;

    setActionLoading(userId);
    try {
      const response = await api.removeBlacklist(userId);
      if (response.success) {
        loadBlacklistedUsers();
      } else {
        alert(response.message || "Failed to remove user from blacklist");
      }
    } catch (error) {
      console.error("Error removing user from blacklist:", error);
      alert("An unexpected error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Blacklisted Users
          </h1>
          <p className="text-gray-500 mt-1">
            Users who have been restricted from accessing the platform
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Date Blacklisted</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4" colSpan={4}>
                      <div className="h-12 bg-gray-50 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : blacklistedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500 italic"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Unlock size={32} className="text-gray-300" />
                      <span>No blacklisted users found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                blacklistedUsers.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                          <UserIcon size={18} className="text-red-600" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-gray-900 truncate">
                            {record.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {record.reason}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-normal">
                        <Calendar size={14} />
                        {record.blackListedAt
                          ? format(
                              new Date(record.blackListedAt),
                              "MMM d, yyyy HH:mm"
                            )
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/users/${record.userId}`}
                          className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          disabled={actionLoading === record.userId}
                          onClick={() =>
                            handleRemoveFromBlacklist(record.userId)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-all border border-green-200 disabled:opacity-50"
                        >
                          {actionLoading === record.userId ? (
                            "Wait..."
                          ) : (
                            <>
                              <Unlock size={14} />
                              Un-blacklist
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}
