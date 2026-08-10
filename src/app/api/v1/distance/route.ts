import { NextResponse } from "next/server";
import { calculatePickupCharge } from "@/lib/utils";

// Shop Address Coordinates (Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001)
const SHOP_LAT = 28.4526094;
const SHOP_LNG = 76.990898;

// Haversine formula to compute great-circle distance in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Substring/Regex backup estimation when geocoding APIs fail
function estimateFallbackDistance(address: string): number {
  const clean = address.toLowerCase();
  
  // Close proximity keywords
  if (
    clean.includes("ninex") ||
    clean.includes("residency") ||
    clean.includes("sector 37c") ||
    clean.includes("sector 37 c") ||
    clean.includes("shop 28") ||
    clean.includes("shop no. 28")
  ) {
    return 0.8; // within 1km
  }
  
  // Sector 37 area
  if (clean.includes("sector 37")) {
    return 1.8;
  }
  
  // Surrounding Sectors (Sector 36, 10, 10A, 9, 38)
  if (
    clean.includes("sector 36") ||
    clean.includes("sector 10") ||
    clean.includes("sector 9") ||
    clean.includes("sector 38")
  ) {
    return 3.5;
  }
  
  // Further parts of Gurugram/Gurgaon
  if (clean.includes("gurugram") || clean.includes("gurgaon")) {
    // If it mentions specific far sectors (like 56, 57, Golf Course Road)
    if (
      clean.includes("sector 56") ||
      clean.includes("sector 57") ||
      clean.includes("sector 62") ||
      clean.includes("sohna") ||
      clean.includes("golf course")
    ) {
      return 12.5;
    }
    return 4.5; // default to within 5km for general Gurugram if not specified far
  }
  
  // Delhi NCR regions (Noida, Ghaziabad, Faridabad, Delhi)
  if (
    clean.includes("delhi") ||
    clean.includes("noida") ||
    clean.includes("faridabad") ||
    clean.includes("ghaziabad") ||
    clean.includes("haryana")
  ) {
    return 28.5; // Far away
  }
  
  // Default fallback if entirely unknown (assume far to be safe or default to 6km)
  return 6.5;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, lat, lng } = body;
    
    // GPS Geolocation check
    if (lat !== undefined && lng !== undefined) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      const distanceKm = Number(calculateHaversineDistance(SHOP_LAT, SHOP_LNG, latitude, longitude).toFixed(1));
      const charge = calculatePickupCharge(distanceKm);
      
      let resolvedAddress = `GPS Coordinates (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
        const response = await fetch(osmUrl, {
          headers: {
            "User-Agent": "SmartCareMobilePointRepairPortal/1.0 (enigcon2020@gmail.com)"
          }
        });
        const data = await response.json();
        if (data && data.display_name) {
          resolvedAddress = data.display_name;
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
      }
      
      return NextResponse.json({
        success: true,
        provider: "gps",
        distanceKm,
        charge,
        address: resolvedAddress,
        text: `${distanceKm} km`
      });
    }
    
    if (!address || typeof address !== "string" || !address.trim()) {
      return NextResponse.json(
        { success: false, error: "Address query or GPS coordinates are required." },
        { status: 400 }
      );
    }
    
    const queryAddress = address.trim();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // 1. Try Google Maps Distance Matrix API if API key exists
    if (apiKey && apiKey !== "PASTE_YOUR_API_KEY_HERE") {
      try {
        const origin = "Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001";
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(queryAddress)}&key=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "OK" && data.rows?.[0]?.elements?.[0]?.status === "OK") {
          const element = data.rows[0].elements[0];
          const distanceValueMeters = element.distance.value;
          const distanceKm = Number((distanceValueMeters / 1000).toFixed(1));
          
          const charge = calculatePickupCharge(distanceKm);
          
          return NextResponse.json({
            success: true,
            provider: "google",
            distanceKm,
            charge,
            text: element.distance.text,
            duration: element.duration?.text
          });
        }
      } catch (err) {
        console.error("Google Maps Distance Matrix API request failed:", err);
      }
    }
    
    // 2. Try OpenStreetMap Nominatim Geocoding + Haversine fallback
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddress)}&format=json&limit=1`;
      
      const response = await fetch(osmUrl, {
        headers: {
          "User-Agent": "SmartCareMobilePointRepairPortal/1.0 (enigcon2020@gmail.com)"
        }
      });
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        const distanceKm = Number(calculateHaversineDistance(SHOP_LAT, SHOP_LNG, lat, lon).toFixed(1));
        const charge = calculatePickupCharge(distanceKm);
        
        return NextResponse.json({
          success: true,
          provider: "openstreetmap",
          distanceKm,
          charge,
          text: `${distanceKm} km`,
          lat,
          lng: lon,
          address: data[0].display_name
        });
      }
    } catch (err) {
      console.error("OpenStreetMap Nominatim geocoding failed:", err);
    }
    
    // 3. Regex/smart text fallback estimation if both APIs fail
    const estimatedDistance = Number(estimateFallbackDistance(queryAddress).toFixed(1));
    const charge = calculatePickupCharge(estimatedDistance);
    
    return NextResponse.json({
      success: true,
      provider: "heuristic",
      distanceKm: estimatedDistance,
      charge,
      text: `${estimatedDistance} km (estimate)`
    });
    
  } catch (err: any) {
    console.error("Distance Matrix Handler error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
