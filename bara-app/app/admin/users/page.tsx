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
  UserX,
  Unlock,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Pagination from "@/components/Pagination";
import { toast } from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(25);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      let response;
      if (debouncedQuery) {
        response = await api.adminSearchUsers(
          debouncedQuery,
          currentPage,
          pageSize
        );
      } else {
        response = await api.adminAllUsers(currentPage, pageSize);
      }

      if (response.success && response.data) {
        const resData = response.data;
        setUsers(Array.isArray(resData.data) ? resData.data : []);
        setTotalPages(resData.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [debouncedQuery, currentPage, pageSize]);

  const handleBlacklist = async () => {
    if (!targetUserId || !blacklistReason.trim()) {
      toast.error("Please provide a reason for blacklisting");
      return;
    }

    setActionLoading(targetUserId);
    try {
      const response = await api.blacklistUser(targetUserId, blacklistReason);
      if (response.success) {
        toast.success("User blacklisted successfully");
        setShowBlacklistModal(false);
        setBlacklistReason("");
        setTargetUserId(null);
        await loadUsers();
      } else {
        toast.error(response.message || "Failed to blacklist user");
      }
    } catch (error) {
      console.error("Blacklist error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveBlacklist = async (userId: string) => {
    if (
      !confirm("Are you sure you want to remove this user from the blacklist?")
    )
      return;

    setActionLoading(userId);
    try {
      const response = await api.removeBlacklist(userId);
      if (response.success) {
        toast.success("User removed from blacklist successfully");
        await loadUsers();
      } else {
        toast.error(response.message || "Failed to remove user from blacklist");
      }
    } catch (error) {
      console.error("Remove blacklist error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (user: any) => {
    if (user.isBlacklisted) return "bg-red-100 text-red-700";

    switch (user.verificationStatus?.toLowerCase()) {
      case "approved":
      case "verified":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Users</h1>
          <p className="text-gray-500 mt-1">
            Manage all registered writers and producers
          </p>
        </div>

        <div className="relative w-full md:w-96 text-wrap">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#810306] focus:border-transparent transition-all"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Joined</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(pageSize)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4" colSpan={5}>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 italic"
                  >
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon size={18} className="text-gray-500" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-gray-900 truncate">
                            {user.name || user.email}
                          </span>
                          {user.name && (
                            <span className="text-xs text-gray-500 truncate">
                              {user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                          user.role === "Writer"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(
                          user
                        )}`}
                      >
                        {user.isBlacklisted
                          ? "Blacklisted"
                          : user.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-normal">
                        <Calendar size={14} />
                        {user.createdAt
                          ? format(new Date(user.createdAt), "MMM d, yyyy")
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
                        >
                          Details
                        </Link>

                        {user.isBlacklisted ? (
                          <button
                            onClick={() => handleRemoveBlacklist(user.id)}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-black hover:bg-green-100 transition-all border border-green-200 disabled:opacity-50"
                          >
                            <Unlock size={12} />
                            Un-blacklist
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setTargetUserId(user.id);
                              setShowBlacklistModal(true);
                            }}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 rounded-lg text-[10px] font-black hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50"
                          >
                            <UserX size={12} />
                            Blacklist
                          </button>
                        )}
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

      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
            <div className="p-6">
              <div className="flex items-center gap-3 text-gray-900 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <UserX size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Blacklist User</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    This action will restrict user access.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <MessageSquare size={16} className="text-[#810306]" />
                    Reason for Blacklisting
                    <span className="text-red-500 font-black">*</span>
                  </label>
                  <textarea
                    value={blacklistReason}
                    onChange={(e) => setBlacklistReason(e.target.value)}
                    placeholder="Provide a clear reason for this action..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#810306] focus:border-transparent outline-none transition-all resize-none min-h-[120px] text-sm text-gray-900"
                    required
                  />
                  <p className="mt-2 text-[10px] text-gray-400 font-medium leading-relaxed">
                    Automated notification will be sent to the user.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowBlacklistModal(false);
                    setTargetUserId(null);
                    setBlacklistReason("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlacklist}
                  disabled={!!actionLoading || !blacklistReason.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
                >
                  {actionLoading ? "Wait..." : "Restrict User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
