import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | LBS MCA Entrance",
  description: "Contact LBS MCA Entrance Learning Platform. Get in touch for support, inquiries, or feedback about our MCA entrance preparation courses.",
  keywords: ["Contact Us", "LBS MCA", "MCA entrance", "Support"],
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: "Contact Us | LBS MCA Entrance",
    description: "Contact LBS MCA Entrance Learning Platform",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {children}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">LBS MCA Entrance</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 LBS MCA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}