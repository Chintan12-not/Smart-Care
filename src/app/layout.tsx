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
  metadataBase: new URL("https://smartcaremobile.in"),
  title: {
    default: "Smart Care & Mobile Point | Doorstep Mobile Repair & Genuine Accessories Gurugram",
    template: "%s | Smart Care & Mobile Point",
  },
  description: "Gurugram's rated #1 doorstep mobile repair service, genuine phone covers, chargers, tempered glass for 600+ models, document printing & photocopy (Xerox) at smartcaremobile.in.",
  keywords: [
    "Mobile Repair Gurugram", 
    "Phone Repair Sector 37C", 
    "Doorstep Mobile Repair", 
    "Smart Care Mobile Point", 
    "smartcaremobile.in", 
    "Mobile Accessories Gurugram",
    "Screen Replacement Gurugram",
    "Document Printing Xerox Sector 37C",
    "Corporate Bulk Mobile Orders"
  ],
  alternates: {
    canonical: "https://smartcaremobile.in",
  },
  openGraph: {
    title: "Smart Care & Mobile Point — Gurugram's Premier Mobile Repair & Accessories Store",
    description: "Doorstep mobile repair, genuine phone accessories for 600+ models, and corporate bulk ordering at smartcaremobile.in.",
    url: "https://smartcaremobile.in",
    siteName: "Smart Care & Mobile Point",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://smartcaremobile.in/hero_background.png",
        width: 1200,
        height: 630,
        alt: "Smart Care & Mobile Point Storefront Sector 37C Gurugram",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Care & Mobile Point | smartcaremobile.in",
    description: "Doorstep mobile repair & genuine accessories store in Gurugram.",
    images: ["https://smartcaremobile.in/hero_background.png"],
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
  // Structured JSON-LD Schema for Google Search Indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "name": "Smart Care & Mobile Point",
    "url": "https://smartcaremobile.in",
    "logo": "https://smartcaremobile.in/logo.png",
    "image": "https://smartcaremobile.in/hero_background.png",
    "description": "Gurugram's premier doorstep mobile repair center, genuine mobile accessories store, document printing & photocopy hub.",
    "telephone": "+919289942313",
    "priceRange": "₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Shop No. 28, Ninex Residency, Sector 37C",
      "addressLocality": "Gurugram",
      "addressRegion": "Haryana",
      "postalCode": "122001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.4388,
      "longitude": 76.9942
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "10:00",
      "closes": "21:00"
    },
    "sameAs": [
      "https://smartcaremobile.in",
      "https://wa.me/919289942313"
    ]
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
