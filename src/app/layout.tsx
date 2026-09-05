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
  metadataBase: new URL("https://www.smartcaremobile.in"),
  title: {
    default: "Mobile Repair & Accessories in Gurugram | Smart Care & Mobile Point",
    template: "%s | Smart Care & Mobile Point",
  },
  description: "Express mobile repair in Gurugram for screen, battery and charging-port issues. Shop mobile accessories for 600+ phone models. Contact Smart Care & Mobile Point today.",
  keywords: [
    "mobile repair in Gurugram", 
    "mobile repair shop in Gurgaon", 
    "express mobile repair Gurgaon", 
    "phone repair Gurgaon", 
    "iPhone repair Gurgaon", 
    "Samsung repair Gurgaon", 
    "mobile accessories Gurgaon",
    "phone accessories Gurgaon",
    "smartcaremobile.in", 
    "screen replacement Gurugram",
    "battery replacement Gurugram",
    "corporate mobile accessories bulk orders"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in",
  },
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/favicon.png", type: "image/png" }
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: ["/logo.png"]
  },
  openGraph: {
    title: "Mobile Repair & Accessories in Gurugram | Smart Care & Mobile Point",
    description: "Express mobile repair in Gurugram for screen, battery and charging-port issues. Shop mobile accessories for 600+ phone models.",
    url: "https://www.smartcaremobile.in",
    siteName: "Smart Care & Mobile Point",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.smartcaremobile.in/hero_background.png",
        width: 1200,
        height: 630,
        alt: "Smart Care & Mobile Point Storefront in Sector 37C Gurugram",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Repair & Accessories in Gurugram | Smart Care",
    description: "Express mobile repair & genuine accessories store in Gurugram. Contact Smart Care today.",
    images: ["https://www.smartcaremobile.in/hero_background.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured JSON-LD Schema for Google LocalBusiness, RepairShop & Organization Indexing
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": ["MobilePhoneStore", "RepairShop"],
    "@id": "https://www.smartcaremobile.in/#localbusiness",
    "name": "Smart Care & Mobile Point",
    "url": "https://www.smartcaremobile.in",
    "logo": "https://www.smartcaremobile.in/logo.png",
    "image": [
      "https://www.smartcaremobile.in/hero_background.png",
      "https://www.smartcaremobile.in/shop_front.png",
      "https://www.smartcaremobile.in/shop_shelf.png"
    ],
    "description": "Gurugram's premier certified express mobile repair center, genuine phone accessories store, and document printing & photocopy hub.",
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
      "https://wa.me/919289942313",
      "https://www.instagram.com/smart.care313"
    ],
    "areaServed": [
      "Gurugram",
      "Sector 37C Gurugram",
      "Sector 45 Gurugram",
      "DLF Phase 1-5 Gurugram",
      "Sohna Road Gurugram",
      "Golf Course Road Gurugram",
      "Palam Vihar Gurugram",
      "Cyber City Gurugram",
      "Haryana"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "27",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://smartcaremobile.in/#website",
    "url": "https://smartcaremobile.in",
    "name": "Smart Care & Mobile Point",
    "description": "Mobile Repair & Genuine Accessories in Gurugram",
    "publisher": {
      "@id": "https://smartcaremobile.in/#localbusiness"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://smartcaremobile.in/accessories?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
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
