"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserSession } from "@/utils/tokenManager";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getUserSession();
    if (!session || session.userType !== "Admin") {
      router.push("/dashboard");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#810306] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            Verifying authorization...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8 pt-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
