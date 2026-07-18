import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

const CANONICAL_LOGIN_URL = "https://participant.ameriflex.com/";
const SITE_DOMAIN = "participant.ameriflex.com";
const SITE_BRAND = "Ameriflex";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#254650",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_BASE_URL || "https://participant.ameriflex.com").replace(/#\/login$/, "")
  ),
  title: {
    default: "Ameriflex Login | MyAmeriflex Participant Portal & FSA Account",
    template: "%s | Ameriflex Login & Benefits Portal",
  },
  keywords: [
    "Ameriflex",
    "Ameriflex login",
    "Ameriflex log in",
    "MyAmeriflex",
    "Ameriflex FSA",
    "Ameriflex flexible spending account",
    "Ameriflex card",
    "Ameriflex flex spending",
    "Ameriflex vinyl",
    "Ameriflex vinly",
    "participant.ameriflex.com",
    "myameriflex login",
    "Ameriflex participant login",
    "Flexible Spending Account login",
    "FSA claims",
    "Ameriflex employee benefits portal",
    "Ameriflex COBRA login",
    "Ameriflex benefits administration",
  ],
  description: `Welcome to the official Ameriflex login portal at ${SITE_DOMAIN} (MyAmeriflex). Securely log in to access your Ameriflex FSA (Flexible Spending Account), check your Ameriflex card balance, manage flex spending, submit claims, and access account resources.`,

  authors: [{ name: "Ameriflex", url: "https://participant.ameriflex.com/" }],
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
    description: `Securely access your Ameriflex account at ${SITE_DOMAIN}. Log in to manage your Ameriflex Flexible Spending Account (FSA), commuter benefits, COBRA, and claims online.`,
    siteName: SITE_BRAND,
    url: CANONICAL_LOGIN_URL,
    images: [
      {
        url: "/30_image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_BRAND} – Participant Portal & Flexible Spending Account Login`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ameriflex Login – MyAmeriflex Participant Portal & FSA Account",
    description: `Securely access your Ameriflex account at ${SITE_DOMAIN}. Log in to manage your Ameriflex Flexible Spending Account (FSA), claims, and employee benefits.`,
    images: ["/30_image.png"],
  },
  icons: {
    icon: "/30_image.png",
    shortcut: "/30_image.png",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://participant.ameriflex.com/#organization",
      name: SITE_BRAND,
      url: "https://participant.ameriflex.com/",
      logo: "https://participant.ameriflex.com/download.jpg",
      description: "Ameriflex provides leading employee benefits solutions including Flexible Spending Accounts (FSA), Health Savings Accounts (HSA), COBRA, and commuter administration.",
      sameAs: [
        "https://www.ameriflex.com/"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://participant.ameriflex.com/#website",
      url: CANONICAL_LOGIN_URL,
      name: "MyAmeriflex Participant Portal",
      description: "Official Ameriflex login portal to manage FSA benefits, check spending account balances, and submit claims online.",
      publisher: {
        "@id": "https://participant.ameriflex.com/#organization"
      },
      inLanguage: "en-US"
    },
    {
      "@type": "WebPage",
      "@id": "https://participant.ameriflex.com/#webpage",
      url: CANONICAL_LOGIN_URL,
      name: "Ameriflex Login – MyAmeriflex Participant Portal & FSA Account",
      description: "Securely log in to access your Ameriflex Flexible Spending Account (FSA), check balances, file claims, and manage your employee benefits.",
      isPartOf: {
        "@id": "https://participant.ameriflex.com/#website"
      },
      about: {
        "@id": "https://participant.ameriflex.com/#organization"
      },
      inLanguage: "en-US"
    },
    {
      "@type": "FAQPage",
      "@id": "https://participant.ameriflex.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I log in to my Ameriflex or MyAmeriflex account?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "To log in to your Ameriflex or MyAmeriflex participant account, enter your registered email address and password on this official portal at participant.ameriflex.com."
          }
        },
        {
          "@type": "Question",
          name: "Where can I check my Ameriflex card balance and Flexible Spending Account (FSA)?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Once logged in to the MyAmeriflex portal, you can view your Ameriflex card balance, manage your Ameriflex FSA (Flexible Spending Account), review recent transactions, and submit new reimbursement claims instantly."
          }
        },
        {
          "@type": "Question",
          name: "What should I do if I need Ameriflex flex spending help or forgot my password?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "If you forgot your Ameriflex log in password or need help with your Ameriflex flex spending account, click the 'Forgot your password?' link below the login card to securely reset your credentials."
          }
        },
        {
          "@type": "Question",
          name: "Does Ameriflex provide industrial vinyl products alongside employee benefits?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "This official portal specifically serves Ameriflex participant employee benefits, including Flexible Spending Accounts (FSA), Health Savings Accounts (HSA), commuter benefits, and COBRA administration."
          }
        }
      ]
    }
  ]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
