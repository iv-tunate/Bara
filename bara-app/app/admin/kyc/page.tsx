"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";
import {
  Search,
  ShieldCheck,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

function KycRetryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [verificationNumber, setVerificationNumber] = useState("");
  const [verificationType, setVerificationType] = useState("BVN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userIdParams = searchParams.get("userId");
    const nameParams = searchParams.get("name");

    if (userIdParams) {
      setSelectedUser({
        id: userIdParams,
        name: nameParams || "Selected User",
        email: "",
      });
    }
  }, [searchParams]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await api.adminSearchUsers(searchQuery);
      if (response.success && response.data) {
        setUsers(Array.isArray(response.data.data) ? response.data.data : []);
      }
    } catch (error) {
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!selectedUser) return;
    if (!verificationNumber) {
      toast.error("Please enter a verification number");
      return;
    }

    const session = getUserSession();
    if (!session) {
      toast.error("Session expired. Please login again.");
      router.push("/auth/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.adminRetryKyc({
        UserId: selectedUser.id,
        AdminId: session.userId,
        VerificationNumber: verificationNumber,
        VerificationType: verificationType,
      });

      if (response.success) {
        toast.success("KYC Retry Process Initialized Successfully");
        router.push(`/admin/users/${selectedUser.id}`);
      } else {
        toast.error(response.message || "Failed to initialize KYC retry");
      }
    } catch (error) {
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Manual KYC Verification
        </h1>
        <p className="text-gray-500 mt-1">
          Initiate a manual identity verification request for a user.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: User Selection */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Step 1: Select User
            </h2>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#810306] focus:border-transparent outline-none"
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    selectedUser?.id === user.id
                      ? "border-[#810306] bg-red-50"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <UserIcon size={14} className="text-gray-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {selectedUser?.id === user.id && (
                    <CheckCircle2 className="text-[#810306]" size={16} />
                  )}
                </button>
              ))}
              {users.length === 0 && !loading && (
                <p className="text-center py-8 text-gray-400 text-xs italic">
                  Search for a user to begin...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Configuration & Action */}
        <div className="space-y-6">
          <div
            className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-opacity ${
              !selectedUser ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">
              Step 2: Verification Details
            </h2>

            {selectedUser && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
                <div className="w-10 h-10 bg-[#810306] text-white rounded-full flex items-center justify-center">
                  <span className="font-bold uppercase">
                    {selectedUser.name?.[0] || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">
                    Initating for:
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedUser.name}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Verification Type
                </label>
                <select
                  value={verificationType}
                  onChange={(e) => setVerificationType(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#810306] outline-none"
                >
                  <option value="BVN">BVN (Bank Verification Number)</option>
                  <option value="NIN">NIN (National Identity Number)</option>
                  <option value="PASSPORT">International Passport</option>
                  <option value="DRIVERS_LICENSE">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Identification Number
                </label>
                <input
                  type="text"
                  placeholder="Enter 11-digit number or ID"
                  value={verificationNumber}
                  onChange={(e) => setVerificationNumber(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#810306] outline-none"
                />
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-3 text-wrap">
                <AlertCircle className="text-yellow-600 shrink-0" size={16} />
                <p className="text-[10px] text-yellow-700 leading-relaxed font-normal">
                  <b className="font-bold">Important:</b> This will trigger an
                  external call to verification providers. Ensure the
                  information provided matches the user's official records.
                </p>
              </div>

              <button
                disabled={!selectedUser || !verificationNumber || isSubmitting}
                onClick={handleRetry}
                className="w-full py-3 bg-[#810306] text-white rounded-lg font-bold text-sm hover:bg-red-900 transition-colors shadow-lg shadow-red-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none mt-4"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Run KYC Verification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KycRetryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-[#810306] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <KycRetryContent />
    </Suspense>
  );
}
