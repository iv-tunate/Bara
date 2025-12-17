"use client";

import { SignalRProvider } from "@/context/SignalRContext";
import ToasterClient from "./ToasterClient";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignalRProvider>
      {children}
      <ToasterClient />
    </SignalRProvider>
  );
}
