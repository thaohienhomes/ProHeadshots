import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/react";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const BG = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The #1 AI Photo Generator in Sweden",
  description:
    "The most popular AI headshot generator in Sweden. Create studio quality headshots with CVPHOTO. Best for professional business headshots.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={BG.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
