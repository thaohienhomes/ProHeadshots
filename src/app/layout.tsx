
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import SessionProvider from "@/components/providers/SessionProvider";
import TrackDeskProvider from "@/components/TrackDeskProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

import { Toaster } from 'react-hot-toast';

const BG = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "coolpix - Professional AI Headshots",
  description:
    "The most popular AI headshot generator. Create studio quality headshots with coolpix. Best for professional business headshots.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Head content for production */}
      </head>
      <body className={BG.className}>
        <GoogleAnalytics />
        <TrackDeskProvider />
        <SessionProvider>
          <ErrorBoundary>
            {children}
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
      </body>
    </html>
  );
}
