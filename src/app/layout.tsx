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
  title: "Meshflow - Intelligent B2B Enablement",
  description: "Outperform by filling knowledge gaps. The intelligent enablement platform for high-performing teams.",
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
