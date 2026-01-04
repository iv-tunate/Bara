"use client";

import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/utils/api";

import { Suspense } from "react";

function ViewSynopsisContent() {
  const searchParams = useSearchParams();
  const scriptId = searchParams?.get("scriptId");
  const [script, setScript] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScript() {
      if (scriptId) {
        try {
          const res = await api.getScriptById(scriptId);
          if (res.success && res.data) {
            setScript(res.data.data || res.data);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadScript();
  }, [scriptId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!script)
    return (
      <div className="p-10 text-center text-red-500">Script not found</div>
    );

  return (
    <div className="h-screen flex flex-col bg-white text-[#22242A]">
      {/* Top Navigation */}
      <DashboardNavbar />

      {/* Page Content */}
      <div className="flex-1 px-4 md:px-10 py-4 w-full space-y-6">
        {/* Title and Buttons */}
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row">
          <h1 className="text-2xl font-semibold tracking-wide w-full md:w-auto">
            {script.title}
          </h1>

          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              href={`/dashboard/scripts/${scriptId}`}
              className="bg-[#810306] hover:bg-[#1a0000] text-white py-2 px-6 rounded-md text-sm font-medium"
            >
              View script
            </Link>
            {/* <button className="border border-[#810306] text-[#810306] py-2 px-4 rounded-md text-sm font-medium hover:bg-[#fff5f5]">
              Message writer
            </button> */}
          </div>
        </div>

        {/* Synopsis Box */}
        <div className="w-full max-w-[800px] mx-auto border border-[#ABADB2] rounded-md p-4 md:p-6 space-y-3 text-xs md:text-sm leading-relaxed">
          <h2 className="text-base font-semibold">Synopsis</h2>

          <div className="whitespace-pre-wrap">{script.synopsis}</div>
        </div>
      </div>
    </div>
  );
}

export default function ViewSynopsisPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ViewSynopsisContent />
    </Suspense>
  );
}
