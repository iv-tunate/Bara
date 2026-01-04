"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useState, useEffect } from "react";
import { getUserSession } from "@/utils/tokenManager";
import { ConfirmModal } from "@/components/ConfirmModal";
import { api } from "@/utils/api";
import toast from "react-hot-toast";

interface Script {
  id: string;
  title: string;
  description: string;
  genre: string;
  price: string;
  daysLeft?: number;
  icon?: string;
  availability: string;
  status: string;
  imageUrl?: string;
  imagePublicId?: string;
  transactionExpiresAt?: string;
  hasActiveTransaction?: boolean;
  activeNegotiatorId?: string;
  writerName?: string;
  writerId?: string;
  currencySymbol?: string;
  activeTransactionId?: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    danger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    danger: false,
    onConfirm: () => {},
  });

   // const { walletData } = useWallet();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const statusClasses: { [key: string]: string } = {
    available: "bg-[#CCCEEF] border-[#000AAF] text-[#000AAF]",
    caution: "bg-[#FFD9BF] border-[#BF4E00] text-[#BF4E00]",
    warning: "bg-[#FFBFBF] border-[#BF0000] text-[#BF0000]",
    Purchased: "bg-[#C3E8BF] border-[#0DA500] text-[#0DA500]",
    Sold: "bg-[#C3E8BF] border-[#0DA500] text-[#0DA500]",
    "In Negotiation": "bg-[#FFD9BF] border-[#BF4E00] text-[#BF4E00]",
  };

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setUserData(session);

    if (session.userType === "Writer") {
      setActiveTab("In Negotiation");
    } else {
      setActiveTab("In Negotiation");
    }

    fetchScripts(session);
  }, []);

  const fetchScripts = async (session: any) => {
    setLoading(true);
    try {
      let fetchedScripts: any[] = [];

      if (session.userType === "Writer") {
        const response = await api.getScriptsByWriterId(session.userId, 1, 50);
        if (response.data?.isSuccess) {
          fetchedScripts = response.data.data;
        }
      } else {
        const [initiatedRes, completedRes] = await Promise.all([
          api.getProducerScriptsByTransaction(
            session.userId,
            "initiated",
            1,
            50
          ),
          api.getProducerScriptsByTransaction(
            session.userId,
            "completed",
            1,
            50
          ),
        ]);

        if (initiatedRes.data?.isSuccess)
          fetchedScripts = [...fetchedScripts, ...initiatedRes.data.data];
        if (completedRes.data?.isSuccess)
          fetchedScripts = [...fetchedScripts, ...completedRes.data.data];
      }

      const formattedScripts = fetchedScripts.map((s: any) => {
        const daysLeft = calculateDaysLeft(s.transactionExpiresAt);
        let availability = "available";
        let icon = "/circle-i.svg";

        if (s.status === "InNegotiation" || s.hasActiveTransaction) {
          if (daysLeft <= 3) {
            availability = "warning";
            icon = "/warning.svg";
          } else if (daysLeft <= 7) {
            availability = "caution";
            icon = "/caution.svg";
          } else {
            availability = "In Negotiation";
          }
        } else if (s.status === "Sold") {
          availability = "Sold";
          icon = "/purchased-icon.svg";
        } else {
          availability = "available";
        }

        if (session.userType === "Producer" && s.status === "Sold") {
          availability = "Purchased";
        }

        const genreDisplay = Array.isArray(s.genre)
          ? s.genre.map((g: any) => g.name).join(", ")
          : s.genre || "Drama";

        return {
          id: s.id,
          title: s.title,
          description: s.logline || s.synopsis,
          genre: genreDisplay,
          price: `${s.currencySymbol || "₦"}${s.price?.toLocaleString()}`,
          daysLeft: daysLeft,
          icon: icon,
          availability: availability,
          status: s.status,
          imageUrl: s.imageUrl,
          transactionExpiresAt: s.transactionExpiresAt,
          hasActiveTransaction: s.hasActiveTransaction,
          activeNegotiatorId: s.activeNegotiatorId,
          writerId: s.writerId,
          writerName: s.writerName,
          currencySymbol: s.currencySymbol,
          activeTransactionId: s.activeTransactionId,
        };
      });

      setScripts(formattedScripts);
    } catch (error) {
      console.error("Failed to fetch scripts:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (expiresAt?: string): number => {
    if (!expiresAt) return 0;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleContact = async (script: Script) => {
    if (chatLoading || !userData) return;
    setChatLoading(true);
    const toastId = toast.loading("Opening chat...");

    try {
      const isWriter = userData.userType === "Writer";
      const writerId = isWriter ? userData.userId : script.writerId;
      const negotiatorId = isWriter
        ? script.activeNegotiatorId
        : userData.userId;

      if (!writerId || !negotiatorId) {
        toast.error("Cannot start chat: Missing participants", { id: toastId });
        return;
      }

      const chatsRes = await api.getChats(userData.userId);
      let existingChatId = null;

      if (chatsRes.success && chatsRes.data) {
        const chatsList = Array.isArray(chatsRes.data)
          ? chatsRes.data
          : chatsRes.data.data || [];
        const targetOtherId = isWriter ? negotiatorId : writerId;
        const existingChat = chatsList.find(
          (c: any) =>
            c.scriptId === script.id && c.otherUserId === targetOtherId
        );
        if (existingChat) existingChatId = existingChat.chatId;
      }

      if (existingChatId) {
        toast.success("Opening conversation", { id: toastId });
        router.push(`/chat?id=${existingChatId}`);
      } else {
        let producerName = "Producer";
        let writerName = script.writerName || "Writer";

        if (isWriter) {
          writerName = userData.name || "Writer";
          if (negotiatorId) {
            try {
              const pRes = await api.getProducerProfile(negotiatorId);
              if (pRes.data?.isSuccess)
                producerName = `${pRes.data.data.firstName} ${pRes.data.data.lastName}`;
            } catch {}
          }
        } else {
          producerName = userData.name || "Producer";
        }

        const createRes = await api.createChat({
          scriptId: script.id,
          producerId: negotiatorId!,
          writerId: writerId!,
          scriptTitle: script.title,
          producerName: producerName,
          writerName: writerName,
        });

        if (createRes.success && createRes.data) {
          const chatId =
            createRes.data.data || createRes.data.chatId || createRes.data;
          const finalChatId = typeof chatId === "object" ? chatId.data : chatId;

          console.log("[Projects Contact] Created chat ID:", finalChatId);
          toast.success("Chat opened", { id: toastId });
          router.push(`/chat?id=${finalChatId}`);
        } else {
          console.error("[Projects Contact] Failed:", createRes);
          toast.error("Failed to open chat", { id: toastId });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred", { id: toastId });
    } finally {
      setChatLoading(false);
    }
  };

  const handleConfirmScript = (script: Script) => {
    setModalConfig({
      isOpen: true,
      title: "Confirm Purchase",
      message: `Are you sure you want to confirm receipt of "${script.title}"? This will release funds to the writer.`,
      danger: false,
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        if (!userData || !script.activeTransactionId) {
          toast.error("Invalid transaction state");
          return;
        }
        try {
          const response = await api.completeScriptTransaction(
            userData.userId,
            script.id,
            script.activeTransactionId
          );
          if (response.data?.isSuccess) {
            toast.success("Script confirmed successfully!");
            fetchScripts(userData);
          } else {
            toast.error(response.data?.message || "Failed to confirm script");
          }
        } catch (error) {
          toast.error("An error occurred");
        }
      },
    });
  };

  const handleCancelTransaction = (script: Script) => {
    setModalConfig({
      isOpen: true,
      title: "Cancel Transaction",
      message: `Are you sure you want to cancel the transaction for "${script.title}"? This action cannot be undone and funds will be refunded.`,
      danger: true,
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        if (!userData || !script.activeTransactionId) {
          toast.error("Invalid transaction state");
          return;
        }
        try {
          const response = await api.cancelScriptTransaction(
            userData.userId,
            script.id,
            script.activeTransactionId
          );
          if (response.data?.isSuccess) {
            toast.success("Transaction cancelled");
            fetchScripts(userData);
          } else {
            toast.error(response.data?.message || "Failed to cancel");
          }
        } catch (error) {
          toast.error("An error occurred");
        }
      },
    });
  };

  const getFilteredScripts = () => {
    if (!userData) return [];
    if (userData.userType === "Writer") {
      if (activeTab === "In Negotiation") {
        return scripts.filter(
          (s) => s.status === "InNegotiation" || s.hasActiveTransaction
        );
      }
      if (activeTab === "Available") {
        return scripts.filter(
          (s) => s.status === "Available" && !s.hasActiveTransaction
        );
      }
      if (activeTab === "Sold") {
        return scripts.filter((s) => s.status === "Sold");
      }
    } else {
      if (activeTab === "In Negotiation") {
        return scripts.filter(
          (s) => s.status === "InNegotiation" || s.hasActiveTransaction
        );
      }
      if (activeTab === "Purchased") {
        return scripts.filter((s) => s.status === "Sold");
      }
    }
    return [];
  };

  const filteredScripts = getFilteredScripts();
  const tabs =
    userData?.userType === "Writer"
      ? ["In Negotiation", "Available", "Sold"]
      : ["In Negotiation", "Purchased"];

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-3 text-[#22242A]">
            My Projects
          </h1>

          <div className="flex flex-row gap-8 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 text-base font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "border-b-4 border-[#810306] text-[#810306] font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#810306]"></div>
              </div>
            ) : filteredScripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 opacity-50">
                  <Image
                    src="/project-icon.png"
                    alt="No projects"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-lg font-semibold text-[#22242A] mb-2">
                  No scripts {activeTab.toLowerCase()}
                </h3>
              </div>
            ) : (
              <div>
                {filteredScripts.map((script) => (
                  <div
                    key={script.id}
                    className="border bg-[#F5F5F5] border-[#ABADB2] rounded-md py-4 px-3 md:p-5 flex flex-col md:flex-row md:gap-6 items-start md:items-stretch justify-between mb-6"
                  >
                    {/* Image */}
                    <div className="relative w-full md:w-72 h-56 md:h-64 rounded-md overflow-hidden shrink-0">
                      <Image
                        src={script.imageUrl || "/projectimg.png"}
                        alt="script image"
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#FFEDEE] border border-[#810306] text-[#810306] text-xs px-2 py-1 rounded">
                        {script.genre}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-medium text-red-800 line-clamp-2">
                        {script.title}
                      </p>

                      <p className="text-[#333740] leading-relaxed text-sm">
                        {script.description}
                      </p>

                      <div className="pt-5 border-t border-gray-300">
                        <p className="text-sm font-medium text-red-800 line-clamp-2">
                          {script.price}
                        </p>
                      </div>

                      {/* Status/Timer Badge - Only if not Available */}
                      {script.status !== "Available" && (
                        <div
                          className={`flex flex-row items-center gap-1 px-1 py-1 rounded-sm text-xs md:w-max border ${
                            statusClasses[script.availability] ||
                            "bg-neutral-800"
                          }`}
                        >
                          <Image
                            src={script.icon || "/circle-i.svg"}
                            alt=""
                            width={16}
                            height={16}
                          />
                          <p>
                            {script.status === "Sold"
                              ? "Sold"
                              : `You have ${script.daysLeft} days left to ${
                                  userData?.userType === "Producer"
                                    ? "confirm"
                                    : "conclude"
                                } or reject script`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 mt-4 md:mt-0 ">
                      {/* IN NEGOTIATION ACTIONS */}
                      {activeTab === "In Negotiation" && (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/writer/my-scripts/${script.id}`)
                            }
                            className="bg-[#810306] text-white px-8 py-2.5 rounded-sm hover:bg-red-800 text-base font-medium transition-colors whitespace-nowrap"
                          >
                            View Script
                          </button>

                          {userData?.userType === "Producer" && (
                            <button
                              onClick={() => handleConfirmScript(script)}
                              className="bg-green-600 text-white px-8 py-2.5 rounded-sm hover:bg-green-700 text-base font-medium transition-colors whitespace-nowrap"
                            >
                              Confirm script
                            </button>
                          )}

                          <button
                            onClick={() => handleContact(script)}
                            disabled={chatLoading}
                            className="bg-white border border-[#810306] text-[#810306] px-8 py-2.5 rounded-sm hover:bg-red-50 text-base font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            Contact
                          </button>

                          <button
                            onClick={() => handleCancelTransaction(script)}
                            className="text-gray-500 hover:text-red-600 text-base text-center border border-[#810306] px-8 py-2.5 rounded-sm bg-red-50 hover:bg-white hover:border-gray-500 font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* SOLD / PURCHASED ACTIONS */}
                      {(activeTab === "Sold" || activeTab === "Purchased") && (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/writer/my-scripts/${script.id}`)
                            }
                            className="bg-[#810306] text-white px-8 py-2.5 rounded-sm hover:bg-red-800 text-base font-medium transition-colors whitespace-nowrap"
                          >
                            View Script
                          </button>
                          <button
                            onClick={() => handleContact(script)}
                            disabled={chatLoading}
                            className="bg-white border border-[#810306] text-[#810306] px-8 py-2.5 rounded-sm hover:bg-red-50 text-base font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            Contact
                          </button>
                        </>
                      )}

                      {/* AVAILABLE ACTIONS (Writer) */}
                      {activeTab === "Available" && (
                        <button
                          onClick={() =>
                            router.push(`/writer/my-scripts/${script.id}`)
                          }
                          className="bg-[#810306] text-white px-8 py-2.5 rounded-sm hover:bg-red-800 text-base font-medium transition-colors whitespace-nowrap"
                        >
                          View Script
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        isDangerous={modalConfig.danger}
        confirmText={modalConfig.danger ? "Yes, Cancel" : "Yes, Confirm"}
      />
    </main>
  );
}
