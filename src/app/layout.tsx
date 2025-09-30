import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Merriweather } from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { ViewportEnforcer } from "@/components/ViewportEnforcer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "600"],
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-mw",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Levezze | Portfolio",
  description:
    "Lev Zhitnik | Full Stack & AI Engineer, Coffee Enthusiast, Former Computational Designer and Architect",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}${inter.variable} ${merriweather.variable} antialiased bg-["#1c1c1c"] font-inter-regular`}
      >
        <ViewportEnforcer />
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
