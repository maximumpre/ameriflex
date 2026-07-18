import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Identity – Account Security",
  description: "Complete multi-factor authentication and verify your identity to securely sign in to your Ameriflex account (MyAmeriflex portal).",
  keywords: [
    "Ameriflex verification",
    "Ameriflex security check",
    "Ameriflex MFA login",
    "myameriflex identity verification",
  ],
  alternates: {
    canonical: "https://participant.ameriflex.com/verify",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Ameriflex Verify Identity & Secure Login",
    description: "Multi-factor verification for your MyAmeriflex participant login session.",
    url: "https://participant.ameriflex.com/verify",
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
