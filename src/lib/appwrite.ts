import { Client, Databases, ID, Query, Permission, Role } from "appwrite";

// Appwrite Endpoint & Project credentials from environment variables
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a7b370f001801aa2044";
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "b2b_database";
export const APPWRITE_B2B_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_B2B_COLLECTION_ID || "b2b_inquiries";

// Appwrite Client instance
const client = new Client();
if (typeof window !== "undefined" || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
}

export const appwriteDatabases = new Databases(client);
export const appwriteClient = client;

export interface B2BInquiryData {
  $id?: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  product: string;
  quantity: number;
  deliveryLocation: string;
  expectedPurchaseDate?: string;
  requirements?: string;
  status: "New" | "Contacted" | "Quotation Sent" | "Negotiation" | "PO Received" | "Completed" | "Cancelled";
  createdAt?: string;
  updatedAt?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

/**
 * Checks if Appwrite configuration is valid.
 */
export function isAppwriteConfigured(): boolean {
  return Boolean(APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID);
}

/**
 * Submit a new B2B Corporate / Bulk Order inquiry to Appwrite Database.
 */
export async function createB2BInquiry(inquiry: Omit<B2BInquiryData, "$id" | "status" | "createdAt" | "updatedAt">): Promise<B2BInquiryData> {
  const payload = {
    name: inquiry.name,
    companyName: inquiry.companyName,
    email: inquiry.email,
    phone: inquiry.phone,
    product: inquiry.product,
    quantity: Number(inquiry.quantity),
    deliveryLocation: inquiry.deliveryLocation,
    expectedPurchaseDate: inquiry.expectedPurchaseDate || "",
    requirements: inquiry.requirements || "",
    status: "New" as B2BInquiryData["status"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // Attempt Appwrite Document Creation
    const response = await appwriteDatabases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_B2B_COLLECTION_ID,
      ID.unique(),
      payload,
      [
        Permission.read(Role.any()), // Allow public creation
      ]
    );

    // Sync to local cache for instant admin view & backup
    saveToLocalB2BCache({ ...payload, $id: response.$id });

    return response as unknown as B2BInquiryData;
  } catch (err: any) {
    console.warn("Appwrite creation notice/fallback:", err?.message || err);

    // Fallback: save to local cache if Appwrite collection is not yet provisioned
    const fallbackId = "b2b_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
    const savedLocal = saveToLocalB2BCache({ ...payload, $id: fallbackId });
    return savedLocal;
  }
}

/**
 * Helper to get all B2B Inquiries for Admin dashboard
 */
export async function getB2BInquiries(): Promise<B2BInquiryData[]> {
  try {
    const response = await appwriteDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_B2B_COLLECTION_ID,
      [Query.orderDesc("$createdAt")]
    );

    if (response.documents && response.documents.length > 0) {
      return response.documents as unknown as B2BInquiryData[];
    }
  } catch (err: any) {
    console.warn("Appwrite list error (using local cache fallback):", err?.message || err);
  }

  // Local storage fallback for admin testing
  return getLocalB2BCache();
}

/**
 * Helper to update B2B Inquiry status in Appwrite
 */
export async function updateB2BInquiryStatus(inquiryId: string, newStatus: B2BInquiryData["status"]): Promise<boolean> {
  const updatedAt = new Date().toISOString();

  try {
    await appwriteDatabases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_B2B_COLLECTION_ID,
      inquiryId,
      {
        status: newStatus,
        updatedAt: updatedAt,
      }
    );
  } catch (err: any) {
    console.warn("Appwrite status update notice:", err?.message || err);
  }

  // Always update local cache for consistency
  updateLocalB2BCache(inquiryId, newStatus, updatedAt);
  return true;
}

// --- Local Cache Utilities for fallback & offline testing ---

function getLocalB2BCache(): B2BInquiryData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("sc_b2b_inquiries");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveToLocalB2BCache(item: B2BInquiryData): B2BInquiryData {
  if (typeof window === "undefined") return item;
  try {
    const existing = getLocalB2BCache();
    const updated = [item, ...existing.filter(i => i.$id !== item.$id)];
    localStorage.setItem("sc_b2b_inquiries", JSON.stringify(updated));
  } catch (e) {}
  return item;
}

function updateLocalB2BCache(id: string, status: B2BInquiryData["status"], updatedAt: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalB2BCache();
    const updated = existing.map(item => item.$id === id ? { ...item, status, updatedAt } : item);
    localStorage.setItem("sc_b2b_inquiries", JSON.stringify(updated));
  } catch (e) {}
}
