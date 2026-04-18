import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aspirant Login | LBS MCA Entrance Learning Platform",
  description: "Access your LBS MCA entrance preparation dashboard. Sign in to attend live classes, watch recorded lectures, and take mock tests.",
  keywords: ["LBS MCA Login", "Student Dashboard", "MCA Entrance Dashboard", "Sign in"],
  alternates: { canonical: "/login" },
  openGraph: {
    url: "/login",
    title: "Student Login | LBS MCA Entrance Platform",
    description: "Sign in to access your coaching materials and dashboard.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
