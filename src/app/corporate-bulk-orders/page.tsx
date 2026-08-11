import CorporateOrdersPage from "../corporate-orders/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Mobile Accessories & Wholesale Bulk Orders Gurgaon",
  description: "Wholesale mobile accessories & corporate electronics procurement in Gurgaon. Bulk orders for chargers, Type-C cables, power banks & earphone gifts with 100% GST invoices.",
  keywords: [
    "mobile accessories wholesale Gurgaon",
    "mobile accessories bulk orders",
    "corporate mobile accessories",
    "bulk phone accessories",
    "corporate electronics procurement",
    "wholesale mobile accessories Gurgaon",
    "GST invoice mobile accessories"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/corporate-bulk-orders",
  },
  openGraph: {
    title: "Corporate & Wholesale Bulk Orders | Smart Care & Mobile Point",
    description: "Bulk mobile accessories procurement for companies, IT hubs & retailers with GST invoicing and fast regional delivery.",
    url: "https://www.smartcaremobile.in/corporate-bulk-orders",
  },
};

export default function CorporateBulkOrdersPage() {
  return <CorporateOrdersPage />;
}
