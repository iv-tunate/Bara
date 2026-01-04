"use client";

import ScriptPDFLayout from "@/components/ScriptPDF";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ScriptReaderContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || undefined;
  const title = searchParams.get("title") || undefined;

  return <ScriptPDFLayout url={url} title={title} />;
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
