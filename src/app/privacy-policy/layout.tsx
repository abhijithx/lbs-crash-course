import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | LBS MCA Entrance Preparation",
  description: "Learn how the LBS MCA Entrance Learning Platform collects, uses, and safeguards your personal data. Your privacy and security are our top priorities.",
  keywords: ["Privacy Policy", "Data Protection", "LBS MCA", "Privacy"],
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    url: "/privacy-policy",
    title: "Privacy Policy | LBS MCA Entrance Platform",
    description: "Our commitment to protecting your personal data and privacy.",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}