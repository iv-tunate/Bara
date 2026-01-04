"use client";

import { useState } from "react";
import SidebarThumbnails from "./SideBarThumbnail";
import PDFCanvas from "./PDFCanva";
import ScriptNavbar from "./ScriptNavbar";

interface ScriptPDFLayoutProps {
  url?: string;
}

export default function ScriptPDFLayout({ url }: ScriptPDFLayoutProps) {
  const [currentPage, setCurrentPage] = useState(1); // track selected page

  return (
    <div className="flex-1 flex flex-col">
      {/* Navbar */}
      <ScriptNavbar />

      {/* Main reader area */}
      <div className="flex h-[calc(100vh-90px)] bg-[#F7F7F7]">
        {/* Sidebar */}
        <SidebarThumbnails
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
        />

        {/* PDF canvas */}
        <PDFCanvas currentPage={currentPage} url={url} />
      </div>
    </div>
  );
}
