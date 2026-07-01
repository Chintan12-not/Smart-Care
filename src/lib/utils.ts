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
export function calculateRepairEstimate(issueType: string): { cost: number; time: string } {
  const issueLower = issueType.toLowerCase();
  if (issueLower.includes("screen") || issueLower.includes("display") || issueLower.includes("broken")) {
    return { cost: 2499, time: "2-3 Hours" };
  } else if (issueLower.includes("battery") || issueLower.includes("charge") || issueLower.includes("drain")) {
    return { cost: 1299, time: "1 Hour" };
  } else if (issueLower.includes("speaker") || issueLower.includes("sound") || issueLower.includes("mic")) {
    return { cost: 899, time: "1-2 Hours" };
  } else if (issueLower.includes("heating") || issueLower.includes("lag") || issueLower.includes("slow")) {
    return { cost: 699, time: "24 Hours (Diagnostics)" };
  } else {
    return { cost: 999, time: "Same Day Delivery" };
  }
}
