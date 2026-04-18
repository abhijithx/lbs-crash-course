import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

import RouteGuard from "@/components/auth/RouteGuard";

export default function StudentSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requireStudent={true} requireVerified={true}>
      {children}
    </RouteGuard>
  );
}