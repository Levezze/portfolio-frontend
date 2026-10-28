import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

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
        url: "/levezze-og-turn.jpg",
        width: 1200,
        height: 630,
        alt: "The site mid page turn: its pages cut into slices, caught rotating",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Levezze | Portfolio",
    description:
      "Lev Zhitnik | Full Stack & AI Engineer | Former Computational Designer & Architect",
    images: ["/levezze-og-turn.jpg"],
  },
  icons: {
    icon: [
      // Drawn per size on a pixel grid, so no SVG: a scaled vector blurs it.
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
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
  themeColor: "#0a0909",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K4FR2L92KD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-K4FR2L92KD');
          `}
        </Script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
