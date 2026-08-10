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

  // Check if we have custom database configurations stored in localStorage
  let dbConfig: any = null;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("sc_estimator_config");
      if (cached) {
        dbConfig = JSON.parse(cached);
      }
    } catch (e) {
      console.error("Error reading cached estimator config:", e);
    }
  }

  // Find if we have a match for this specific brand
  const matchedBrandConfig = dbConfig && brand 
    ? dbConfig.find((c: any) => c.brand.toLowerCase() === brand.toLowerCase() || brand.toLowerCase().includes(c.brand.toLowerCase()))
    : null;

  if (matchedBrandConfig) {
    // Determine base cost from custom config
    if (issueLower.includes("screen") || issueLower.includes("display") || issueLower.includes("broken")) {
      baseCost = parseFloat(matchedBrandConfig.screen_base_price || 2499);
      time = "2-3 Hours";
    } else if (issueLower.includes("battery") || issueLower.includes("charge") || issueLower.includes("drain")) {
      baseCost = parseFloat(matchedBrandConfig.battery_base_price || 1299);
      time = "1 Hour";
    } else if (issueLower.includes("speaker") || issueLower.includes("sound") || issueLower.includes("mic")) {
      baseCost = parseFloat(matchedBrandConfig.speaker_base_price || 899);
      time = "1-2 Hours";
    } else if (issueLower.includes("heating") || issueLower.includes("lag") || issueLower.includes("slow")) {
      baseCost = parseFloat(matchedBrandConfig.diagnostics_base_price || 699);
      time = "24 Hours (Diagnostics)";
    } else {
      baseCost = parseFloat(matchedBrandConfig.other_base_price || 999);
    }

    const multiplier = parseFloat(matchedBrandConfig.multiplier || 1.0);
    return { cost: Math.round(baseCost * multiplier), time };
  }

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

/**
 * Calculates pickup & drop charges based on distance.
 */
export function calculatePickupCharge(distanceKm: number): number {
  if (distanceKm <= 5.0) return 0;
  if (distanceKm <= 10.0) return 120;
  if (distanceKm <= 15.0) return 200;
  return 300; // Beyond 15 km
}
