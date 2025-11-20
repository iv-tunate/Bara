import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import SessionGuard from "./hooks/sessionguard";
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "Bara App",
  description:
    "Your trusted platform for managing and exploring scripts effortlessly.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lato.variable}>
      <body className="font-sans bg-white text-black">
        {/* <SessionGuard>{children}</SessionGuard> */}
        {children}
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
      </body>
    </html>
  );
}
