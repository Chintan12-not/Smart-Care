"use client";

// Safe Conversion Tracking Utility for GA4 & GTM

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type ConversionCategory = "primary" | "secondary";

export interface AnalyticsEventParams {
  category?: ConversionCategory;
  label?: string;
  value?: number;
  location?: string;
  [key: string]: any;
}

/**
  Tracks primary & secondary conversion events safely across GA4 and GTM.
  Primary Conversions: phone_click, whatsapp_click, booking_submit, contact_submit
  Secondary Conversions: directions_click, cta_click
 */
export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === "undefined") return;

  const eventData = {
    event_category: params.category || "primary",
    event_label: params.label || "",
    event_location: params.location || window.location.pathname,
    ...params,
  };

  // 1. Google Analytics (gtag)
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, eventData);
    } catch (e) {
      console.warn("GA4 event tracking warning:", e);
    }
  }

  // 2. Google Tag Manager (dataLayer)
  if (Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: eventName,
        ...eventData,
      });
    } catch (e) {
      console.warn("GTM dataLayer push warning:", e);
    }
  }
}

// Shortcut Tracking Methods
export const trackPhoneClick = (location = "page") => {
  trackEvent("phone_click", {
    category: "primary",
    label: "Phone Call Click",
    location,
  });
};

export const trackWhatsAppClick = (location = "page") => {
  trackEvent("whatsapp_click", {
    category: "primary",
    label: "WhatsApp Inquiry Click",
    location,
  });
};

export const trackBookingSubmit = (serviceName = "Pickup Repair", location = "pickup_form") => {
  trackEvent("booking_submit", {
    category: "primary",
    label: `Booking Submitted - ${serviceName}`,
    location,
  });
};

export const trackContactSubmit = (location = "contact_form") => {
  trackEvent("contact_submit", {
    category: "primary",
    label: "Contact Form Submitted",
    location,
  });
};

export const trackDirectionsClick = (location = "footer") => {
  trackEvent("directions_click", {
    category: "secondary",
    label: "Google Maps Directions Click",
    location,
  });
};

export const trackCTAClick = (ctaName: string, location = "page") => {
  trackEvent("cta_click", {
    category: "secondary",
    label: ctaName,
    location,
  });
};
