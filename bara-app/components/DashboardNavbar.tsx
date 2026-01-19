import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import AccountDropdown, { UserData, WalletData } from "./AccountDropdown";
import MessageDropdown from "./MessageDropdown";
import { getUserSession, clearUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";
import { useWallet } from "@/context/WalletContext";
import { downloadImage } from "@/utils/upload";

export default function DashboardNavbar() {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showMessageDropdown, setShowMessageDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { walletData, isLoading: walletLoading } = useWallet();
  const pathname = usePathname();

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      const loadProfileImage = async () => {
        let imageUrl = undefined;
        if (session.profileImageUrl) {
          try {
            if (session.profileImageUrl.startsWith("http")) {
              imageUrl = session.profileImageUrl;
            } else {
              imageUrl = await downloadImage(
                session.profileImageUrl,
                "cloudinary",
              );
            }
          } catch (e) {
            console.error("Failed to load profile image", e);
          }
        }

        setUserData({
          userId: session.userId,
          name: session.name,
          email: session.email,
          userType: session.userType,
          verificationStatus: session.VerificationStatus,
          isVerified: session.isVerified,
          profileImageUrl: imageUrl,
        });
        setIsLoading(false);
      };

      loadProfileImage();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white px-4 md:px-8 py-3 shadow-md flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            width={50}
            height={50}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Middle: Search bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:flex">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search authors and genres"
            className="w-full border border-[#ABADB2] rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#800000] placeholder-[#858990]"
          />
          <Image
            src="/search-icon.png"
            alt="Search"
            width={24}
            height={24}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#22242A]">
        {/* Dashboard Link */}
        {pathname !== "/dashboard" && (
          <Link
            href="/dashboard"
            className="hover:text-[#800000] hover:bg-gray-100 flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>
        )}

        {/* Messages Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMessageDropdown((prev) => !prev)}
            className="hover:text-[#800000] hover:bg-gray-100 flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md transition-colors"
          >
            <Image src="/Message.png" alt="Messages" width={18} height={18} />{" "}
            Messages
          </button>
          {showMessageDropdown && (
            <MessageDropdown onClose={() => setShowMessageDropdown(false)} />
          )}
        </div>

        {/* My Projects - Link to page */}
        <Link
          href="/dashboard/projects"
          className="hover:text-[#800000] hover:bg-gray-100 flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md transition-colors"
        >
          <Image
            src="/project-icon.png"
            alt="Projects"
            width={16}
            height={16}
          />{" "}
          My Projects
        </Link>

        {/* Account */}
        <div className="relative">
          <button
            onClick={() => setShowAccountDropdown((prev) => !prev)}
            className="hover:text-[#800000] hover:bg-gray-100 flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md transition-colors"
          >
            {userData?.profileImageUrl ? (
              <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200">
                <Image
                  src={userData.profileImageUrl}
                  alt="Account"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <Image src="/User_alt.png" alt="Account" width={16} height={16} />
            )}
            Account
          </button>
          {showAccountDropdown && (
            <div className="absolute top-full right-0 mt-2">
              <AccountDropdown
                onClose={() => setShowAccountDropdown(false)}
                userData={userData}
                walletData={walletData ?? undefined}
                isLoading={isLoading || walletLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setShowMobileMenu((prev) => !prev)}
        className="md:hidden p-2 text-[#800000] hover:text-[#1a0000] transition-colors"
        aria-label="Toggle menu"
      >
        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md border-t border-gray-200 z-40 md:hidden">
          <div className="flex flex-col items-start px-6 py-4 space-y-4">
            {/* Account */}
            <div className="relative w-full">
              <button
                onClick={() => setShowAccountDropdown((prev) => !prev)}
                className="bg-[#800000] text-white font-medium w-full py-3 rounded-md hover:bg-[#1a0000] transition-colors text-center cursor-pointer"
              >
                Account
              </button>
              {showAccountDropdown && (
                <div className="absolute top-full left-0 w-full mt-2 z-50">
                  <AccountDropdown
                    onClose={() => setShowAccountDropdown(false)}
                    userData={userData}
                    walletData={walletData ?? undefined}
                    isLoading={isLoading || walletLoading}
                  />
                </div>
              )}
            </div>

            {/* Saved Scripts */}
            {/* <Link
              href="/dashboard/saved-scripts"
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setShowMobileMenu(false)}
            >
              <Image
                src="/Shape.png"
                alt="Saved Scripts"
                width={16}
                height={16}
              />{" "}
              Saved scripts
            </Link> */}

            {/* Messages Dropdown Mobile */}
            <div className="relative w-full">
              <button
                onClick={() => setShowMessageDropdown((prev) => !prev)}
                className="bg-[#800000] text-white font-medium w-full py-3 rounded-md hover:bg-[#1a0000] transition-colors text-center cursor-pointer"
              >
                Messages
              </button>
              {showMessageDropdown && (
                <div className="absolute top-full left-0 w-full mt-2 z-50">
                  <MessageDropdown
                    onClose={() => setShowMessageDropdown(false)}
                  />
                </div>
              )}
            </div>

            {/* My Projects - Link to page */}
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setShowMobileMenu(false)}
            >
              <Image
                src="/project-icon.png"
                alt="Projects"
                width={16}
                height={16}
              />{" "}
              My Projects
            </Link>

            {/* Dashboard Link Mobile */}
            {pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>{" "}
                Dashboard
              </Link>
            )}

            {/* Mobile Search */}
            {/* <div className="w-full mt-2">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search authors and genres"
                  className="w-full border border-[#ABADB2] rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#800000] placeholder-[#858990]"
                />
                <Image
                  src="/search-icon.png"
                  alt="Search"
                  width={24}
                  height={24}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
              </div>
            </div> */}
            {/* Terms Link Mobile */}
            <Link
              href="/terms"
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md mt-2 border-t border-gray-100 pt-3"
              onClick={() => setShowMobileMenu(false)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>{" "}
              Terms & Conditions
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
