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
    null
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const session = getUserSession();
    if (!session?.accessToken) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7119/notificationHub", {
        accessTokenFactory: () => session.accessToken,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (!connection) return;

    const startConnection = async () => {
      try {
        await connection.start();
        setIsConnected(true);
        console.log("SignalR Connected");

        connection.on("KycSuccessful", (data: { message: string }) => {
          toast.success(data.message);
        });

        connection.on("KycFailed", (data: { message: string }) => {
          toast.error(data.message);
        });

        connection.on(
          "WalletUpdated",
          (data: { Balance: number; Total: number }) => {
            toast.success("Wallet balance updated!");
          }
        );

        connection.on(
          "TransferVerified",
          (data: { Reference: string; Status: string }) => {
            toast.success(
              `Transfer ${data.Reference} verified: ${data.Status}`
            );
          }
        );

        connection.on(
          "MessageReceived",
          (data: { ChatId: string; Message: any; ScriptTitle: string }) => {
            toast(
              `New message in ${
                data.ScriptTitle
              }: ${data.Message.Content?.substring(0, 20)}...`,
              {
                icon: "💬",
                duration: 4000,
              }
            );
          }
        );

        connection.on("ReceiveNotification", (message: string) => {
          toast(message, { icon: "🔔" });
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

  return (
    <SignalRContext.Provider value={{ connection, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};
