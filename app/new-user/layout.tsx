import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/site-url";

export const metadata: Metadata = {
  alternates: { canonical: null },
  title: "New User Registration & Account Setup",
  description: "Register for your new Ameriflex account (MyAmeriflex) to access your Flexible Spending Account (FSA), submit claims, and manage benefits online.",
  keywords: [
    "Ameriflex registration",
    "Ameriflex new user sign up",
    "register for MyAmeriflex",
    "Ameriflex create account",
    "Ameriflex FSA enrollment login",
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
    title: "Ameriflex New User Registration & Setup",
    description: "Enroll or register your account on the MyAmeriflex portal to manage your Flexible Spending Account (FSA) and employee benefits.",
    url: `${SITE_ORIGIN}/new-user`,
  },
};

export default function NewUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
