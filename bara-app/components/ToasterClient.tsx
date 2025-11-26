"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterClient() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fff",
          color: "#333",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
        success: {
          iconTheme: {
            primary: "#0DA500",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#800000",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
