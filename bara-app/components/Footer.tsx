"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#810306] py-5 px-5 sm:px-20 flex flex-col sm:flex-row items-center gap-5 sm:gap-0 justify-between">
      {/* Logo */}
      <div className="flex justify-center sm:justify-start w-full sm:w-auto">
        <Image
          src="/logo-red-bg.png"
          alt="footer logo"
          width={150}
          height={120}
        />
      </div>

      {/* Links */}
      <div className="flex flex-col sm:flex-row text-white gap-3 sm:gap-10 text-md items-center">
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
