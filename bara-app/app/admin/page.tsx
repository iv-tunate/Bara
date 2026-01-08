"use client";

import { useEffect, useState } from "react";
import { getUserSession } from "@/utils/tokenManager";
import { Users, TrendingUp, ShieldCheck, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      setAdminEmail(session.email);
    }
  }, []);

  const stats = [
    {
      name: "Total Users",
      value: "---",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Pending KYC",
      value: "---",
      icon: ShieldCheck,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      name: "Daily Activity",
      value: "---",
      icon: Activity,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      name: "Platform Growth",
      value: "+---%",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back,{" "}
          <span className="text-[#810306] font-semibold">{adminEmail}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 border border-gray-100 transition-colors">
              <p className="font-semibold text-sm text-[#810306]">Review KYC</p>
              <p className="text-xs text-gray-500 font-normal mt-1 text-wrap">
                Check pending verification requests
              </p>
            </button>
            <button className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 border border-gray-100 transition-colors">
              <p className="font-semibold text-sm text-[#810306]">
                User Search
              </p>
              <p className="text-xs text-gray-500 font-normal mt-1 text-wrap">
                Find users by name or email
              </p>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center border-dashed">
          <p className="text-gray-400 text-sm italic py-12 text-center">
            Analytics and live activity logs will be displayed here in future
            updates.
          </p>
        </div>
      </div>
    </div>
  );
}
