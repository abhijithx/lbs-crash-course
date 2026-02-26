// app/layout.tsx


import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import AppFrame from "@/components/AppFrame"
import { AuthProvider } from "@/contexts/auth-context"
import { GlobalLoader } from "@/components/global-loader"
import { PWAProvider } from "@/components/pwa-provider"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { FeedbackProvider } from "@/contexts/feedback-context"
import { FeedbackPopup } from "@/components/feedback/feedback-popup"
import { OrientationHandler } from "@/components/orientation-handler"
// import { RamuChatbot } from "@/components/chatbot/ramu-chatbot"
import { Toaster } from "@/components/ui/toaster"
import { ExamCountdownNotification } from "@/components/exam-countdown-notification"

const inter = Inter({ subsets: ["latin"] })


export const metadata: Metadata = {
  title: "CETMCA26 - Community",
  description: "Official website for CETMCA26 Open Source Community",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CETMCA26",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "CETMCA26",
    title: "CETMCA26 - Community",
    description: "Official website for CETMCA26 Open Source Community ",
  },
  twitter: {
    card: "summary",
    title: "CETMCA26 - Community",
    description: "Official website for CETMCA26 Open Source Community",
  },
}


export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
 


  return (
    <html lang="en" suppressHydrationWarning>
     
      <head>
        <meta name="application-name" content="CETMCA26" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CETMCA26" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#000000" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
        
      <body className={inter.className}>
        <GlobalLoader />
          <OrientationHandler />
           <PWAProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
             <FeedbackProvider>
          <div className="flex min-h-screen flex-col">

              <AppFrame>{children}</AppFrame>
          </div>
            {/* <RamuChatbot /> */}
            <Toaster />
           <PWAInstallPrompt />
           <FeedbackPopup />
           
          </FeedbackProvider>
          </AuthProvider>
        </ThemeProvider>
        </PWAProvider>
      </body>
    </html>
  )
}
