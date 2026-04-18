import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | LBS MCA Entrance",
  description: "Terms and Conditions for LBS MCA Entrance Learning Platform. Read our terms covering platform usage, payments, and user responsibilities.",
  keywords: ["Terms of Service", "Terms and Conditions", "LBS MCA", "MCA entrance"],
  alternates: { canonical: "/terms-of-service" },
  openGraph: {
    url: "/terms-of-service",
    title: "Terms of Service | LBS MCA Entrance",
    description: "Terms and Conditions for LBS MCA Entrance Learning Platform",
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {children}
      <footer className="border-t border-[var(--border)] py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-semibold">LBS MCA Entrance</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy-policy" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Terms of Service</Link>
            <Link href="/contact" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Contact Us</Link>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">© 2026 LBS MCA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}