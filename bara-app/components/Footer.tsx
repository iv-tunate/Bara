"use client";

import Image from "next/image";
import Link from "next/link";

export default function DashboardNavbar() {
  return (
    <footer className="bg-red-900 py-5 px-20 flex flex-row gap-80 items-center justify-around">
      <Image
        src="/logo-red-bg.png"
        alt="footer logo"
        width={150}
        height={120}
      />
      <div className="flex flex-row text-white gap-10 text-md">
        <Link href="/privacy-policy">
          <p>Privacy Policy</p>
        </Link>
        <Link href="/help">
          <p>Help</p>
        </Link>
        <Link href="/terms-of-use">
          <p>Terms of Use</p>
        </Link>
      </div>
    </footer>
  );
}
