"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSession } from "../../utils/tokenManager";
export function usePageGuard(session: UserSession | null) {
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (!session.profileComplete) {
      router.push(`/profile/setup/${session.userType}`);
      return;
    }
  }, [session, router]);
}
