import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SeoJsonLd } from "@/components/seo-json-ld";
import ProtectedLayout from "@/components/protected-layout";
import { SITE_KEYWORDS, SITE_DESCRIPTION } from "@/lib/seo-metadata";
import { SITE_HOMEPAGE_CANONICAL, SITE_ORIGIN } from "@/lib/site-url";
import "./globals.css";

// Step 4: ProtectedLayout reads request headers (geo/bot) via next/headers.
export const dynamic = "force-dynamic";

const geist = Geist({ subsets: ["latin"] });

// Step 6: canonical origin lives ONLY in lib/site-url.ts (operator paste).
const CANONICAL_LOGIN_URL = SITE_HOMEPAGE_CANONICAL;
const SITE_DOMAIN = new URL(SITE_ORIGIN).hostname;
const SITE_BRAND = "Ameriflex";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#254650",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Ameriflex Login | MyAmeriflex Participant Portal & FSA Account",
    template: "%s | Ameriflex",
  },
  keywords: SITE_KEYWORDS,
  description: SITE_DESCRIPTION,

  authors: [{ name: "Ameriflex", url: SITE_HOMEPAGE_CANONICAL }],
  creator: "Ameriflex",
  publisher: "Ameriflex",
  applicationName: SITE_BRAND,
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Ameriflex Login – MyAmeriflex Participant Portal & FSA Account",
    description: SITE_DESCRIPTION,
    siteName: SITE_BRAND,
    url: CANONICAL_LOGIN_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_BRAND} – Participant Portal & Flexible Spending Account Login`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ameriflex Login – MyAmeriflex Participant Portal & FSA Account",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/target-assets/favicon-lg.png",
    shortcut: "/target-assets/favicon-lg.png",
    apple: "/30_image.png",
  },
  category: "Business & Finance",
  alternates: {
    canonical: CANONICAL_LOGIN_URL,
    languages: {
      "en-US": CANONICAL_LOGIN_URL,
    },
  },
  other: {
    "geo.region": "US",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geist.className} font-sans antialiased`}>
        <SeoJsonLd />
        <ProtectedLayout>{children}</ProtectedLayout>
        <Analytics />
      </body>
    </html>
  );
}
