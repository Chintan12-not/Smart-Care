import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple Tailwind CSS classes and resolves conflicts using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency amount into Indian Rupees (INR).
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generates dynamic repair cost and time estimates.
 */
export function calculateRepairEstimate(issueType: string, brand?: string): { cost: number; time: string } {
  const issueLower = issueType.toLowerCase();
  let baseCost = 999;
  let time = "Same Day Delivery";

  if (issueLower.includes("screen") || issueLower.includes("display") || issueLower.includes("broken")) {
    baseCost = 2499;
    time = "2-3 Hours";
  } else if (issueLower.includes("battery") || issueLower.includes("charge") || issueLower.includes("drain")) {
    baseCost = 1299;
    time = "1 Hour";
  } else if (issueLower.includes("speaker") || issueLower.includes("sound") || issueLower.includes("mic")) {
    baseCost = 899;
    time = "1-2 Hours";
  } else if (issueLower.includes("heating") || issueLower.includes("lag") || issueLower.includes("slow")) {
    baseCost = 699;
    time = "24 Hours (Diagnostics)";
  }

  // Brand pricing multiplier
  let multiplier = 1.0;
  if (brand) {
    const brandLower = brand.toLowerCase();
    if (brandLower === "apple" || brandLower.includes("iphone") || brandLower.includes("pixel") || brandLower.includes("nothing")) {
      multiplier = 1.8; // Premium devices
    } else if (brandLower.includes("samsung") || brandLower.includes("oneplus")) {
      multiplier = 1.4; // Mid-high tier devices
    } else if (brandLower.includes("vivo") || brandLower.includes("oppo") || brandLower.includes("xiaomi") || brandLower.includes("realme")) {
      multiplier = 1.1;
    }
  }

  return { cost: Math.round(baseCost * multiplier), time };
}
