import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, category, brand, targetModel } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    const titleLower = name.toLowerCase();
    const catLower = (category || "").toLowerCase();
    const targetText = targetModel ? `${targetModel}` : `${brand} devices`;

    const prompt = `Write a high-converting e-commerce product description for a mobile phone accessory.
Product Title: "${name}"
Category: "${category || "Mobile Accessory"}"
Brand: "${brand || "Universal"}"
Compatible Device: "${targetModel || "Universal / All Models"}"

Strict Formatting Rules:
- Return 4 to 5 bullet lines. Each line MUST start with an UPPERCASE KEYWORD IN CAPS followed by a colon.
- Example:
  MAGSAFE COMPATIBLE: Built-in magnetic ring ensures seamless compatibility...
  PERFECT FIT: Precisely designed for the ${targetText}, with accurate cutouts...
  STRONG PROTECTION: Offers reliable all-round protection against everyday drops...
  SLEEK AND STYLISH DESIGN: Features a slim profile that adds a modern look...
  EASY INSTALLATION: Snaps on and off quickly and effortlessly without any tools required.
- Do NOT include markdown headers, introductory text, or bullet symbols like • or *. Just plain lines starting with UPPERCASE KEYWORD:`;

    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("PASTE_")) {
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 400 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText && generatedText.trim().length > 30) {
            return NextResponse.json({ success: true, description: generatedText.trim() });
          }
        }
      } catch (aiErr) {
        console.warn("[AI Generate Description Error, fallback active]", aiErr);
      }
    }

    // High-Quality Uppercase Keyword Format Fallbacks
    let fallbackDesc = "";

    if (catLower.includes("tempered") || titleLower.includes("glass") || titleLower.includes("screen")) {
      fallbackDesc = `9H HARDNESS SHATTERPROOF: Engineered with premium Japanese tempered glass to shield ${targetText} from severe drops, sharp scratches, and key scuffs.
99.9% HD CRYSTAL CLARITY: Ultra-clear 0.3mm optical design preserves original screen brightness, touch sensitivity, and smooth display responsiveness.
OLEOPHOBIC ANTI-FINGERPRINT: Hydrophobic top layer repels fingerprint smudges, oils, and sweat for a clean display screen all day.
EASY BUBBLE-FREE INSTALLATION: Advanced auto-adsorption technology ensures effortless, zero-bubble alignment within seconds without tools.`;
    } else if (catLower.includes("case") || catLower.includes("cover") || titleLower.includes("case") || titleLower.includes("cover")) {
      fallbackDesc = `MAGSAFE COMPATIBLE: Built-in magnetic ring ensures seamless compatibility with MagSafe chargers and accessories, enabling effortless wireless charging.
PERFECT FIT: Precisely designed for ${targetText}, with accurate cutouts for all buttons, ports, and camera lenses for full, unobstructed access.
STRONG PROTECTION: Offers reliable all-round protection with shock-absorbing corners against everyday drops, bumps, and scratches.
SLEEK AND STYLISH DESIGN: Features a premium semi-transparent finish with a slim profile that adds a modern look while keeping the case lightweight.
EASY INSTALLATION: Flexible yet sturdy construction allows the case to snap on and off your phone quickly and effortlessly without tools.`;
    } else if (catLower.includes("charger") || catLower.includes("power") || titleLower.includes("charger")) {
      fallbackDesc = `FAST POWER DELIVERY: Delivers maximum high-speed charging to ${targetText} up to 3x faster than standard wall adapter bricks.
SMART SAFETY PROTECTION: Built-in intelligent chip actively monitors heat, prevents over-current, voltage spikes, and short-circuits.
UNIVERSAL COMPATIBILITY: Engineered for flagship smartphones, tablets, and wireless audio devices with optimal power output.
COMPACT TRAVEL DESIGN: Ultra-lightweight and portable build easy to carry for daily commute, office, and travel use.`;
    } else if (catLower.includes("cable") || titleLower.includes("cable")) {
      fallbackDesc = `ULTRA-DURABLE BRAIDED NYLON: Double-braided ballistic nylon jacket tested to withstand over 12,000+ extreme 90-degree bends.
60W FAST CHARGING & SYNC: Supports high-speed Power Delivery charging and fast 480Mbps data transfer for ${targetText}.
REINFORCED STRAIN RELIEF: Anti-fray aluminum connectors prevent neck breakage at cable tips under heavy daily usage.
TANGLE-FREE DESIGN: Flexible, hassle-free cable construction easy to roll for travel, car, office, and bedside use.`;
    } else {
      fallbackDesc = `PREMIUM BUILD QUALITY: Crafted with high-grade durable materials specifically engineered for ${targetText} for long-lasting performance.
PERFECT FIT & FINISH: Designed with exact dimensions for full accessibility, smooth tactile feel, and modern aesthetic styling.
ALL-ROUND PROTECTION: Shields your device against everyday wear, scratches, dust, and light impact drops.
EASY TO USE: Lightweight and user-friendly construction designed for effortless daily operation.`;
    }

    return NextResponse.json({ success: true, description: fallbackDesc });

  } catch (error: any) {
    console.error("AI description generator error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate description" }, { status: 500 });
  }
}
