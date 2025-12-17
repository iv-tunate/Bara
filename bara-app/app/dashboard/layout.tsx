"use client";

import { ScriptProvider } from "@/context/ScriptContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ScriptProvider>{children}</ScriptProvider>;
}
