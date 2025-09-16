import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MyRuntimeProvider } from "@/components/providers/MyRuntimeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Levezze | Portfolio",
  description: "Lev Zhitnik | Full Stack & AI Engineer, Coffee Enthusiast, Former Computational Design Architect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MyRuntimeProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </MyRuntimeProvider>
  );
}
