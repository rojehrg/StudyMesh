import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/posthog-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ['400', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Attunly - Ask for help in Slack without overthinking",
  description: "Type /attunly in Slack. Get a calm draft that makes the ask easy to send. Move the work forward.",
  keywords: ["Slack", "help requests", "team communication", "remote teams", "Slack commands", "workplace communication"],
  authors: [{ name: "Attunly" }],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Attunly - Ask for help in Slack without overthinking",
    description: "Type /attunly in Slack. Get a calm draft that makes the ask easy to send. Move the work forward.",
    type: "website",
    locale: "en_US",
    siteName: "Attunly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Attunly - Ask for help in Slack without overthinking",
    description: "Type /attunly in Slack. Get a calm draft that makes the ask easy to send.",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (history.scrollRestoration) {
                history.scrollRestoration = 'manual';
              }
              window.scrollTo(0, 0);
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          sourceSerif.variable
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
