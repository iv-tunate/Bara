import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import ToasterClient from "@/components/ToasterClient";

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
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
