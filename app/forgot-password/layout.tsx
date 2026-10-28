import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/site-url";

export const metadata: Metadata = {
  alternates: { canonical: null },
  title: "Forgot Password & Account Recovery",
  description: "Recover your Ameriflex account password and regain access to your MyAmeriflex Flexible Spending Account (FSA), HSA, and employee benefits portal.",
  keywords: [
    "Ameriflex forgot password",
    "Ameriflex password recovery",
    "Ameriflex login help",
    "myameriflex reset password",
    "Ameriflex FSA account recovery",
  ],
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
    title: "Ameriflex Forgot Password & Account Recovery",
    description: "Reset your password for the MyAmeriflex participant login portal to manage your Flexible Spending Account (FSA) and claims.",
    url: `${SITE_ORIGIN}/forgot-password`,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
