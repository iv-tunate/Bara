"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSession } from './../../utils/tokenManager';

export function PageGaurd(user: UserSession | null) {
  const router = useRouter();

  useEffect(() => {
    if (!user) return; 

    if (!user.profileComplete) {
      router.push(`/profile/setup/${user.userType}`);
    }
  }, [user, router]);
}
