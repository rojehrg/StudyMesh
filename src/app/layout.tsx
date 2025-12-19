import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"], 
  variable: "--font-roboto",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Meshflow - Coordinate Help Across Time Zones for Remote Teams",
  description: "See who's available when, coordinate help in seconds, and connect on Slack. Free alternative to Calendly for distributed teams. Perfect for remote startups and support teams.",
  keywords: ["remote team coordination", "team availability scheduling", "time zone meeting planner", "slack team coordination", "distributed team tools", "who's available now", "remote work scheduling"],
  openGraph: {
    title: "Meshflow - Remote Team Coordination Made Simple",
    description: "Know who to ask, when they're free, and coordinate help across time zones. Built for distributed startups and support teams.",
    type: "website",
    url: "https://meshflow.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meshflow - Coordinate Help Across Time Zones",
    description: "Visual team availability + contextual nudges + Slack integration. Free for remote teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          roboto.variable
        )}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
