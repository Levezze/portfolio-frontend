import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
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
  description: "Lev Zhitnik | Full Stack & AI Engineer, Coffee Enthusiast, Former Computational Designer and Architect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-["#1c1c1c"]`}
        >
        <ThemeWrapper>
          {children}
        </ThemeWrapper>
      </body>
    </html>
  );
}
