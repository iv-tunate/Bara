"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getUserSession } from "@/utils/tokenManager";
import { toast } from "react-hot-toast";
import { api } from "@/utils/api";

type SignalRContextType = {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
};

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
});

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);

  const [authToken, setAuthToken] = useState<string | null>(null);
  useEffect(() => {
    const checkSession = () => {
      const session = getUserSession();
      setAuthToken(session?.accessToken || null);
    };

    checkSession();

    const handleAuthChange = () => checkSession();
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!authToken) {
      if (connection) {
        connection.stop();
        setConnection(null);
        setIsConnected(false);
      }
      return;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const hubUrl = `${apiBaseUrl}/notification`;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => authToken,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      // Clean up connection on unmount or token change
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, [authToken]);

  useEffect(() => {
    if (!connection) return;

    const startConnection = async () => {
      try {
        if (connection.state === signalR.HubConnectionState.Connected) {
          setIsConnected(true);
          console.log("SignalR Already Connected");
          return;
        }

        if (connection.state !== signalR.HubConnectionState.Disconnected) {
          return;
        }

        await connection.start();
        setIsConnected(true);
        console.log("SignalR Connected");

        connection.on("KycSuccessful", (data: { message: string }) => {
          toast.success(data.message);
          showNativeNotification("Verification Successful", data.message);
        });

        connection.on("KycFailed", (data: { message: string }) => {
          toast.error(data.message);
          showNativeNotification("Verification Failed", data.message);
        });

        connection.on(
          "WalletUpdated",
          (data: { Balance: number; Total: number }) => {
            toast.success("Wallet balance updated!");
          },
        );

        connection.on(
          "TransferVerified",
          (data: { Reference: string; Status: string }) => {
            toast.success(
              `Transfer ${data.Reference} verified: ${data.Status}`,
            );
            showNativeNotification(
              "Transfer Verified",
              `Transfer ${data.Reference} is now ${data.Status}`,
            );
          },
        );

        connection.on(
          "MessageReceived",
          (data: { ChatId: string; Message: any; ScriptTitle: string }) => {
            // Only show toast if window is NOT focused or not on chat page?
            // Actually, showing toast is always fine.
            const msgPreview =
              data.Message.Content?.substring(0, 30) +
              (data.Message.Content?.length > 30 ? "..." : "");

            toast(`New message in ${data.ScriptTitle}: ${msgPreview}`, {
              icon: "💬",
              duration: 4000,
            });

            // Native notification if page is hidden
            if (document.hidden) {
              showNativeNotification(
                `Message from ${data.ScriptTitle}`,
                msgPreview,
              );
            }
          },
        );

        connection.on("ReceiveNotification", (message: string) => {
          toast(message, { icon: "🔔" });
          if (document.hidden) {
            showNativeNotification("New Notification", message);
          }
        });

        connection.on("ReceiveSupportMessage", (data: any) => {
          // Handled by SupportChatWindow mostly, but we can show toast if not there
          // For now, assume global handler acts as backup
        });
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
        setIsConnected(false);
      }
    };

    startConnection();

    connection.onclose(() => {
      setIsConnected(false);
      console.log("SignalR Disconnected");
    });

    return () => {
      connection.stop();
    };
  }, [connection]);

  const showNativeNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "/logo.png", // Ensure logo.png exists in public
      });
    }
  };

  return (
    <SignalRContext.Provider value={{ connection, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};
