"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { getUserSession, clearUserSession } from "@/utils/tokenManager";
import { useEffect, useState } from "react";


import { Users as UsersIcon } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const session = getUserSession();
    if (session && session.userType === "Admin") {
      setAdminEmail(session.email);
    }
  }, []);

  const handleLogout = () => {
    clearUserSession();
    router.push("/auth/login");
  };

  const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "App Users", href: "/admin/users", icon: UsersIcon },
    { name: "Manual KYC", href: "/admin/kyc", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center gap-2 px-6 py-8">
        <Image src="/logo.png" alt="Bara Logo" width={40} height={40} />
        <span className="text-xl font-bold text-[#810306]">Admin Panel</span>
      </div>

      {/* Admin Info */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="min-w-8 h-8 rounded-full bg-[#810306] flex items-center justify-center text-white shrink-0">
            <UserIcon size={16} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-gray-900 truncate">
              Administrator
            </span>
            <span className="text-[10px] text-gray-500 truncate">
              {adminEmail || "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#810306] text-white shadow-lg shadow-red-900/20"
                  : "text-gray-600 hover:bg-red-50 hover:text-[#810306]"
              }`}
            >
              <link.icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
        >
          <LogOut
            size={18}
            className="group-hover:translate-x-0.5 transition-transform"
          />
          Logout
        </button>
      </div>
    </div>
  );
}
