"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserSession } from "@/utils/tokenManager";

interface SessionGuardProps {
  children: React.ReactNode;
}

export default function SessionGuard({ children }: SessionGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      router.replace("/auth/login"); 
    }
  }, [router]);

  return children;
}
