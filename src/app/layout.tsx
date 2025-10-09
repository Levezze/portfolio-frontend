import type { Metadata, Viewport } from "next";
import { Saira } from "next/font/google";
import { GlobalNavigationManager } from "@/components/GlobalNavigationManager";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import "./globals.css";

const inter = Saira({
  variable: "--font-inter",
  weight: ["400", "600"],
  subsets: ["latin"],
});

const merriweather = Saira({
  variable: "--font-mw",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Levezze | Portfolio",
  description:
    "Lev Zhitnik | Full Stack & AI Engineer | Former Computational Designer & Architect",
  metadataBase: new URL("https://levezze.com"),
  openGraph: {
    title: "Levezze | Portfolio",
    description:
      "Lev Zhitnik | Full Stack & AI Engineer | Former Computational Designer & Architect",
    url: "https://levezze.com",
    siteName: "Levezze Portfolio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/levezze-og.png",
        width: 1200,
        height: 630,
        alt: "Levezze Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Levezze | Portfolio",
    description:
      "Lev Zhitnik | Full Stack & AI Engineer | Former Computational Designer & Architect",
    images: ["/levezze-og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} antialiased bg-background font-inter-regular`}
      >
        <GlobalNavigationManager />
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
