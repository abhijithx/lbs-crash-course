import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enroll in LBS MCA Preparation 2025 | Registration Page",
  description: "Join the most comprehensive Kerala LBS MCA Entrance Crash Course. Select your package and start your journey with live interactive classes and rank-boosting mock tests.",
  keywords: ["LBS MCA Registration", "Enroll MCA Coaching", "Kerala MCA entrance enroll", "MCA training sign up"],
  alternates: { canonical: "/register" },
  openGraph: {
    url: "/register",
    title: "Join LBS MCA Entrance Learning Platform | Start Preparing Now",
    description: "Enroll in the premier LBS MCA coaching. Live classes and full syllabus coverage.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
