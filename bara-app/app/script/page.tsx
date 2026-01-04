"use client";

import ScriptPDFLayout from "@/components/ScriptPDF";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ScriptReaderContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || undefined;

  return <ScriptPDFLayout url={url} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading Viewer...
        </div>
      }
    >
      <ScriptReaderContent />
    </Suspense>
  );
}
