import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/react";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

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
      <body className={BG.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
