import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/posthog-provider";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";

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
    images: [
      {
        url: "https://attunly.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Attunly - Ask for help in Slack, without the friction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Attunly - Ask for help in Slack without overthinking",
    description: "Type /attunly in Slack. Get a calm draft that makes the ask easy to send.",
    images: ["https://attunly.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Attunly",
  url: "https://attunly.com",
  logo: "https://attunly.com/icon.png",
  description: "Ask for help in Slack without overthinking. Get a calm draft that makes the ask easy to send.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://attunly.com/support",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Attunly",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description: "Type /attunly in Slack. Get a calm draft that makes the ask easy to send. Move the work forward.",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "1",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://attunly.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing",
      item: "https://attunly.com/pricing",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Support",
      item: "https://attunly.com/support",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resource hints for faster connections */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Supabase API preconnect */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        {/* Slack API preconnect for avatar images */}
        <link rel="preconnect" href="https://avatars.slack-edge.com" />
        {/* PostHog preconnect */}
        <link rel="preconnect" href="https://us.i.posthog.com" />
        {/* DNS prefetch for additional domains */}
        <link rel="dns-prefetch" href="https://slack.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
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
        {/* Skip to content link - first focusable element for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a6d62] focus:ring-offset-2"
        >
          Skip to content
        </a>
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" richColors />
            <WebVitalsReporter />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
