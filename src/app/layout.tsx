
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import SessionProvider from "@/components/providers/SessionProvider";
import TrackDeskProvider from "@/components/TrackDeskProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AffonsoDebugger from "@/components/AffonsoDebugger";
import { generateMetadata, seoConfigs } from "@/utils/seo";
import { SkipToContent } from "@/components/ui/AccessibilityEnhancements";

import { Toaster } from 'react-hot-toast';

const BG = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = generateMetadata(seoConfigs.home);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Head content for production */}
        {/* Affonso affiliate tracking script with error handling */}
        <script
          async
          defer
          src="https://affonso.io/js/pixel.min.js"
          data-affonso="cmds69rp40042myuiowb6hje8"
          data-cookie_duration="30"
          onError="console.log('Affonso script failed to load')"
        />
      </head>
      <body className={BG.className}>
        <SkipToContent />
        <GoogleAnalytics />
        <TrackDeskProvider />
        <SessionProvider>
          <ErrorBoundary>
            <main id="main-content">
              {children}
            </main>
          </ErrorBoundary>
        </SessionProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #06b6d4',
            },
            success: {
              iconTheme: {
                primary: '#06b6d4',
                secondary: '#1e293b',
              },
            },
          }}
        />
        <Analytics />
        <AffonsoDebugger />
      </body>
    </html>
  );
}
