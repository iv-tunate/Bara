"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import WriterProfileCard from "@/components/WriterProfileCard";
import PaymentSuccessModal from "@/components/PaymentSuccessModal";
import { getUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";
import { Script, ownershipLabels } from "@/models/script";
import { usePageGuard } from "@/app/hooks/usepageguard";
import { useScriptContext } from "@/context/ScriptContext";
import { convertToNaira } from "@/app/hooks/priceconverter";
import { toast } from "react-hot-toast";
import { useWallet } from "@/context/WalletContext";

export default function ScriptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const scriptIdParam = params?.scriptId as string;

  const { getScript, cacheScript } = useScriptContext();
  const { walletData, refreshWallet } = useWallet();
  const [script, setScript] = useState<Script | null>(null);
  const [writerProfile, setWriterProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  const session = getUserSession();
  usePageGuard();

  const scriptLink = script
    ? `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/dashboard/scripts/${script.id}`
    : "";

  useEffect(() => {
    async function loadData() {
      if (!scriptIdParam) {
        setIsLoading(false);
        return;
      }

      const cachedScript = getScript(scriptIdParam);
      if (cachedScript) {
        setScript(cachedScript);
        setIsLoading(false);
      }

      try {
        const scriptResponse = await api.getScriptById(scriptIdParam);
        // console.log("Script API Response:", scriptResponse);

        if (scriptResponse.success && scriptResponse.data) {
          const sData = scriptResponse.data.data || scriptResponse.data;
          // console.log("Script Data:", sData);

          const userId = session?.userId;
          if (userId && sData.writerId === userId) {
            router.push(`/writer/my-scripts/${scriptIdParam}`);
            return;
          }

          const mappedScript: Script = {
            id: sData.id,
            title: sData.title,
            price: sData.price,
            imageUrl: sData.imageUrl || "/flowery.png",
            logline: sData.logline,
            synopsis: sData.synopsis,
            genre: sData.genre,
            writerId: sData.writerId,
            writerName: sData.writerName,
            status: sData.status,
            currency: sData.currency || "NAIRA",
            currencySymbol: sData.currencySymbol || "₦",
            ownershipRights: sData.ownershipRights,
            proofUrl: sData.proofUrl,
            copyrightNumber: sData.copyrightNumber,
            isScriptRegistered: sData.isScriptRegistered,
            registrationBody: sData.registrationBody,
            url: sData.url,
            path: sData.path || "",
            uploadedOn: sData.uploadedOn,
            activeNegotiatorId: sData.activeNegotiatorId,
            hasActiveTransaction: sData.hasActiveTransaction,
            transactionExpiresAt: sData.transactionExpiresAt,
          };

          // console.log("Mapped Script:", mappedScript);
          setScript(mappedScript);
          cacheScript(mappedScript);

          if (sData.writerId) {
            const writerResp = await api.getWriterProfile(sData.writerId);
            if (writerResp.success && writerResp.data) {
              const writerData = writerResp.data.data || writerResp.data;
              setWriterProfile(writerData);
            }
          }
        } else if (!cachedScript) {
          // console.log("Script not found or unsuccessful response");
          setError("Script not found");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (!cachedScript) {
          setError("Failed to load data");
        }
      } finally {
        // console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    }
    loadData();
  }, [scriptIdParam, session?.userId]);

  const walletBalance = walletData?.availableBalance || 0;
  const walletCurrency = walletData?.currencySymbol || "NAIRA";

  const balanceInNaira = convertToNaira(walletBalance, walletCurrency);
  const priceInNaira = script
    ? convertToNaira(script.price, script.currency)
    : 0;
  const isHighInsufficient = balanceInNaira < priceInNaira;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(scriptLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAuthorized =
    session?.userId &&
    script &&
    (script.activeNegotiatorId === session.userId ||
      script.writerId === session.userId);

  const handleContact = async () => {
    if (chatLoading || !session || !script) return;
    setChatLoading(true);
    const toastId = toast.loading("Opening chat...");

    try {
      const isWriter = session.userType === "Writer";
      const writerId = isWriter ? session.userId : script.writerId;
      const negotiatorId = isWriter
        ? script.activeNegotiatorId
        : session.userId;

      if (!writerId || !negotiatorId) {
        toast.error("Cannot start chat: Missing participants", { id: toastId });
        return;
      }

      const chatsRes = await api.getChats(session.userId);
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
        const createRes = await api.createChat({
          scriptId: script.id,
          producerId: negotiatorId!,
          writerId: writerId!,
          scriptTitle: script.title,
          producerName: session.name || "Producer",
          writerName: script.writerName || "Writer",
        });

        if (createRes.success && createRes.data) {
          // The API returns ResponseDetail nested in data
          const chatId =
            createRes.data.data || createRes.data.chatId || createRes.data.data;
          // Ensure it's a string, not object
          const finalChatId = typeof chatId === "object" ? chatId.data : chatId;

          console.log("[Contact] Created chat ID:", finalChatId);
          toast.success("Chat opened", { id: toastId });
          router.push(`/chat?id=${finalChatId}`);
        } else {
          console.error("[Contact] Failed to create chat:", createRes);
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

  const handlePayment = async () => {
    if (!script || !agreed || !session) return;
    setIsProcessingPayment(true);
    setError("");

    try {
      // debugger;
      if (!isHighInsufficient) {
        const response = await api.initiateScriptTransaction(
          session.userId,
          script.id!,
          script.writerId!
        );

        if (response.success) {
          await refreshWallet();
          setShowPaymentSuccessModal(true);
        } else {
          setError(response.message || "Failed to process payment");
        }
      } else {
        const deficit = priceInNaira - balanceInNaira;
        const roundedDeficit = Math.ceil(deficit);

        router.push(`/wallet/fund?amount=${roundedDeficit}`);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setIsProcessingPayment(false);
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error || !script) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center flex-col gap-4">
        <p className="text-red-500">{error || "Script not found"}</p>
        <button
          onClick={() => router.push("/dashboard/scripts")}
          className="text-[#810306] hover:underline"
        >
          Go Back
        </button>
      </main>
    );
  }

  const isInsufficient = walletBalance < script.price;

  return (
    <main className="min-h-screen bg-white overflow-x-hidden relative">
      <DashboardNavbar />

      <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-3 space-y-4">
          <h1 className="text-xl font-semibold text-[#22242A] wrap-break-word">
            {script.title}
          </h1>

          <img
            src={script.imageUrl || "/flowery.png"}
            alt={script.title}
            width={400}
            height={300}
            className="w-full h-auto rounded-md object-cover"
          />

          <p className="text-lg font-semibold text-[#22242A]">
            {script.currencySymbol}
            {script.price?.toLocaleString() ?? "0"}
          </p>

          {!isAuthorized ? (
            <button className="w-full bg-[#FFEDEE] text-[#810306] text-sm font-semibold py-3 rounded-md">
              <span className="flex items-center gap-2 justify-start pl-6">
                <Image src="/heart.png" alt="Save" width={16} height={16} />
                Save this script
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/scripts/ViewScript?scriptId=${script.id}`
                  )
                }
                className="w-full bg-[#810306] text-white py-3 rounded-md text-sm font-medium hover:bg-[#6e0305] transition"
              >
                View Content
              </button>
              <button
                onClick={handleContact}
                disabled={chatLoading}
                className="w-full border border-[#810306] text-[#810306] py-3 rounded-md text-sm font-medium hover:bg-gray-50 transition"
              >
                {chatLoading ? "Opening..." : "Message Writer"}
              </button>
            </div>
          )}

          <hr className="border-t border-[#ABADB2] my-2" />

          {/* Copy script section */}
          {/* <div>
            <p className="text-sm text-[#333740] mb-1 font-medium">
              Copy this script
            </p>
            <div className="relative inline-flex items-center">
              <button
                onClick={handleCopy}
                className="p-1 hover:opacity-80"
                aria-label="Copy link"
              >
                <Image src="/copy.png" alt="Copy" width={20} height={20} />
              </button>

              {copied && (
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs text-[#0DA500] whitespace-nowrap">
                  Copied!
                </span>
              )}
            </div>
          </div> */}
        </div>

        {/* MIDDLE SECTION */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-[#ABADB2] rounded-md p-4 space-y-4">
            {/* Script Title */}
            <div className="p-4 border rounded">
              <h2 className="font-semibold text-lg">{script.title}</h2>

              {script.ownershipRights && (
                <span className="flex items-center text-[11px] font-medium text-[#BF4E00] bg-[#FFD9BF] border border-[#BF4E00] px-2 py-1 rounded">
                  <Image
                    src="/info.png"
                    alt="Info"
                    width={14}
                    height={14}
                    className="mr-1"
                  />
                  {ownershipLabels[script.ownershipRights]}
                </span>
              )}
            </div>

            <p className="text-sm text-[#333740] leading-snug">
              {script.logline}
            </p>

            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-[#F5F5F5] rounded-md text-sm font-medium text-[#858990] flex items-center justify-center gap-2 border border-[#E5E7EB]">
                <Image src="/lock.png" alt="Synopsis" width={16} height={16} />
                Synopsis
              </button>
              <button className="flex-1 py-3 bg-[#F5F5F5] rounded-md text-sm font-medium text-[#858990] flex items-center justify-center gap-2 border border-[#E5E7EB]">
                <Image src="/lock.png" alt="Script" width={16} height={16} />
                Script
              </button>
            </div>

            <hr className="border-t border-[#E5E7EB]" />

            {!isAuthorized && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-[#22242A]">
                  Payment method
                </h3>

                {/* Wallet Option - Now the only option and non-selectable */}
                <div className="flex items-center justify-between rounded-md py-3 px-3 bg-[#F5F5F5] border border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/wallet.png"
                      alt="Wallet"
                      width={24}
                      height={24}
                    />
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-[#333740]">
                        ₦{walletBalance.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-[#858990]">
                        Available Balance
                      </span>
                    </div>
                  </div>
                  {/* No radio button here as per requirements */}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                    {error}
                  </div>
                )}

                {/* NDA Agreement */}
                <div className="flex items-start gap-2 mt-2">
                  <input
                    type="checkbox"
                    className="mt-1 accent-[#800000]"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <p className="text-[11px] leading-snug text-[#333740]">
                    By checking this box, you agree to the Non‑Disclosure
                    Agreement, committing not to share, misuse, or reproduce the
                    information in this synopsis. Your payment will be securely
                    held by Bara. You have 14 days from today to review the
                    script, engage with the writer, and confirm the order.
                  </p>
                </div>

                {/* Payment Button */}
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isProcessingPayment || !agreed}
                  className="w-full bg-[#800000] text-white py-3 rounded-md text-sm font-medium hover:bg-[#4d0000] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment
                    ? "Processing..."
                    : isInsufficient
                    ? "Top Up Wallet"
                    : "Make Payment"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - Dynamic Writer Profile */}
        <div className="lg:col-span-3">
          {writerProfile ? (
            <WriterProfileCard
              name={
                writerProfile.name ||
                `${writerProfile.firstName} ${writerProfile.lastName}`
              }
              bio={writerProfile.bio || "No bio available."}
              profileImage={
                writerProfile.profileImageUrl ||
                writerProfile.profileImage ||
                "/writer.png"
              }
              portfolioLink={writerProfile.portfolioUrl || "#"}
              onViewProfile={() => {
                router.push(`/writer/profile/${writerProfile.id}`);
              }}
            />
          ) : (
            <div className="text-gray-500 text-sm p-4 border rounded">
              Loading writer profile...
            </div>
          )}
        </div>
      </div>

      {/* Payment success modal */}
      {showPaymentSuccessModal && script && (
        <PaymentSuccessModal
          scriptId={script.id}
          onClose={() => setShowPaymentSuccessModal(false)}
        />
      )}
    </main>
  );
}
