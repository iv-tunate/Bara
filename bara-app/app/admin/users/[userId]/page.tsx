"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/utils/api";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Wallet,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scripts");

  useEffect(() => {
    const loadUserDetail = async () => {
      setLoading(true);
      try {
        const response = await api.adminUserDetail(userId);
        if (response.success && response.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load user detail:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserDetail();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-[#810306] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <XCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-900">User not found</h2>
        <Link
          href="/admin/users"
          className="text-[#810306] hover:underline mt-4 inline-block"
        >
          Back to users
        </Link>
      </div>
    );
  }

  const tabs = [
    {
      id: "scripts",
      name: "Scripts",
      icon: FileText,
      count: user.scripts?.length || 0,
    },
    {
      id: "transactions",
      name: "Wallet Transactions",
      icon: CreditCard,
      count: user.transactions?.length || 0,
    },
    {
      id: "script-transactions",
      name: "Script Sales/Purchases",
      icon: CheckCircle,
      count: user.scriptTransactions?.length || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#810306] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Users
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-wrap">
        <div className="h-24 bg-linear-to-r from-[#810306] to-[#b01e21]"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-6 text-wrap">
              <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-lg border border-gray-100">
                <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={48} className="text-gray-300" />
                  )}
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      user.role === "Writer"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{user.email}</p>
              </div>
            </div>

            <div className="flex gap-3 mb-2">
              <Link
                href={`/admin/kyc?userId=${user.id}&name=${encodeURIComponent(
                  user.name
                )}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#810306] text-white rounded-lg text-sm font-semibold hover:bg-red-900 transition-colors shadow-sm"
              >
                <ShieldCheck size={18} />
                Manually Retry KYC
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 border-t border-gray-100 pt-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  {user.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  {user.phoneNumber || "No phone number"}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  Joined {format(new Date(user.createdAt), "MMMM d, yyyy")}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Verification Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm px-3 py-1 rounded-full font-bold ${
                      user.verificationStatus === "Approved"
                        ? "bg-green-100 text-green-700"
                        : user.verificationStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.verificationStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {user.isVerified ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <Clock size={14} className="text-gray-400" />
                  )}
                  {user.isVerified
                    ? "Account is fully verified"
                    : "Account verification incomplete"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Wallet Overview
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-1">
                    <Wallet size={18} className="text-[#810306]" />
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-tight">
                      Available Balance
                    </span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 tracking-tighter">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: user.currency || "NGN",
                    }).format(user.walletBalance)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Locked
                    </p>
                    <p className="text-sm font-bold text-gray-700">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: user.currency || "NGN",
                      }).format(user.lockedBalance)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Total
                    </p>
                    <p className="text-sm font-bold text-gray-700">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: user.currency || "NGN",
                      }).format(user.totalBalance)}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 mb-1">
                    <CreditCard size={18} className="text-green-700" />
                    <span className="text-xs text-green-700 uppercase font-bold tracking-tight">
                      Total Earnings
                    </span>
                  </div>
                  <p className="text-xl font-black text-green-900 tracking-tighter">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: user.currency || "NGN",
                    }).format(user.totalEarnings)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === tab.id
                  ? "text-[#810306]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
              <span className="ml-1 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full text-[10px]">
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#810306]"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "scripts" && (
            <div className="space-y-4">
              {user.scripts?.length > 0 ? (
                user.scripts.map((script: any) => (
                  <div
                    key={script.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 group"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-[#810306] transition-colors">
                        {script.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded{" "}
                        {format(new Date(script.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600 uppercase font-medium">
                        {script.status}
                      </span>
                      <Link
                        href={`/script/${script.id}`}
                        target="_blank"
                        className="text-gray-400 hover:text-[#810306]"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic text-center py-12">
                  No scripts found for this user.
                </p>
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-4">
              {user.transactions?.length > 0 ? (
                <div className="space-y-2">
                  {user.transactions.map((t: any) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 border-b border-gray-50 text-wrap"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {t.type}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          #{t.id.slice(0, 8)} •{" "}
                          {format(new Date(t.createdAt), "MMM d, yyyy HH:mm")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-black ${
                            t.amount < 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {t.amount > 0 ? "+" : ""}
                          {new Intl.NumberFormat("en-NG").format(t.amount)}
                        </p>
                        <span className="text-[10px] uppercase font-bold text-gray-400">
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic text-center py-12">
                  No transactions found.
                </p>
              )}
            </div>
          )}

          {activeTab === "script-transactions" && (
            <div className="space-y-4">
              {user.scriptTransactions?.length > 0 ? (
                user.scriptTransactions.map((st: any) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {st.scriptTitle}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Sale/Purchase on{" "}
                        {format(new Date(st.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900 tracking-tighter">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        }).format(st.amount)}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-[#810306] bg-red-50 px-2 rounded">
                        {st.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic text-center py-12">
                  No script-related transactions found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
