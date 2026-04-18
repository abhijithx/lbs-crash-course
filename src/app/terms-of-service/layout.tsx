import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | LBS MCA Entrance Preparation",
  description: "Terms and conditions for using the LBS MCA Entrance Learning Platform. Important information regarding access, fees, and rules for Kerala MCA entrance coaching.",
  keywords: ["Terms of Service", "Student Agreement", "LBS MCA", "Rules"],
  alternates: { canonical: "/terms-of-service" },
  openGraph: {
    url: "/terms-of-service",
    title: "Terms of Service | LBS MCA Entrance Platform",
    description: "Guidelines and rules for using our online learning platform.",
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}