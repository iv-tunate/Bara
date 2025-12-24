"use client";

import { SignalRProvider } from "@/context/SignalRContext";
import { WalletProvider } from "@/context/WalletContext";
import ToasterClient from "./ToasterClient";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignalRProvider>
      <WalletProvider>
        {children}
        <ToasterClient />
      </WalletProvider>
    </SignalRProvider>
  );
}
