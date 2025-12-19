import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Meshflow - Coordinate Help Across Time Zones for Remote Teams",
  description: "Visual team availability, contextual help requests, and Slack integration. Free alternative to Calendly for small remote teams. Built for distributed startups and support teams.",
  keywords: ["remote team coordination", "time zone scheduling", "team availability", "Slack integration", "distributed teams", "remote work tools"],
  authors: [{ name: "Meshflow" }],
  openGraph: {
    title: "Meshflow - Remote Team Coordination Made Simple",
    description: "Know who to ask, when they're free, and coordinate help in seconds. Built for distributed startups and support teams.",
    type: "website",
    locale: "en_US",
    siteName: "Meshflow",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meshflow - Coordinate Help Across Time Zones",
    description: "Visual team availability + contextual nudges + Slack integration. Free for small remote teams.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          roboto.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
