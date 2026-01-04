import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/posthog-provider";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Attunly - Coordinate Help Across Time Zones for Remote Teams",
  description: "Visual team availability, contextual help requests, and Slack integration. Free alternative to Calendly for small remote teams. Built for distributed startups and support teams.",
  keywords: ["remote team coordination", "time zone scheduling", "team availability", "Slack integration", "distributed teams", "remote work tools"],
  authors: [{ name: "Attunly" }],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Attunly - Remote Team Coordination Made Simple",
    description: "Know who to ask, when they're free, and coordinate help in seconds. Built for distributed startups and support teams.",
    type: "website",
    locale: "en_US",
    siteName: "Attunly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Attunly - Coordinate Help Across Time Zones",
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
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
