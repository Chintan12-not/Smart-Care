import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Care & Mobile Point | Health & Mobile Solutions",
  description: "India's advanced AI-powered Healthcare + Jan Aushadhi generic medicine comparison + Mobile Repair platform. Get medical guidance and book mobile repair services instantly.",
  keywords: ["Jan Aushadhi", "Generic Medicine", "Mobile Repair Delhi", "AI Health Assistant", "Smart Care", "Mobile Accessories"],
  openGraph: {
    title: "Smart Care & Mobile Point",
    description: "Your One-Stop Destination for Healthcare & Mobile Solutions.",
    url: "https://smartcare.in",
    siteName: "Smart Care",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Care & Mobile Point",
    description: "Advanced AI-powered Healthcare + Jan Aushadhi + Mobile Repair platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


