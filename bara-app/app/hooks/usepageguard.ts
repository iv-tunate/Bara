import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getUserSession } from "@/utils/tokenManager";

export function usePageGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      const encoded = encodeURIComponent(pathname);
      router.replace(`/auth/login?returnUrl=${encoded}`);
    }
  }, [router, pathname]);
}
