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
    const targetText = targetModel ? `for ${brand} ${targetModel}` : `for ${brand} devices`;

    const prompt = `Write a high-converting, irresistible, e-commerce product description for a mobile phone accessory.
Product Title: "${name}"
Category: "${category || "Mobile Accessory"}"
Brand: "${brand || "Universal"}"
Compatible Device: "${targetModel || "Universal / All Models"}"

Instructions:
- Write 3 to 4 detailed, bullet points highlighting key features, material engineering, protection/performance, and warranty.
- Make it sound premium, authoritative, and extremely persuasive for online buyers.
- Directly reference the exact compatibility (${targetText}).
- Use crisp bullet points (starting with •). Do not include introductory filler lines like "Here is a description:".`;

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

    // High Quality Category-Specific Detailed Fallbacks
    let fallbackDesc = "";

    if (catLower.includes("tempered") || titleLower.includes("glass") || titleLower.includes("screen")) {
      fallbackDesc = `• 9H Hardness Shatterproof Protection: Engineered with Japanese Asahi tempered glass to shield ${targetText} from severe drops, scratches, and key scuffs.
• 99.9% HD Crystal Clarity: Ultra-thin 0.3mm design preserves original touch sensitivity, vibrant screen colors, and smooth 120Hz display scrolling.
• Oleophobic Anti-Fingerprint Coating: Hydrophobic layer repels oil, smudges, and sweat for a clean display screen all day.
• Bubble-Free Easy Installation: Auto-adsorption technology ensures flawless, zero-bubble alignment in seconds.`;
    } else if (catLower.includes("case") || catLower.includes("cover") || titleLower.includes("case") || titleLower.includes("cover")) {
      fallbackDesc = `• Military-Grade Drop Protection: Reinforced TPU shock-absorbing corners and raised camera bezels protect ${targetText} against impact from drops up to 10 feet.
• Precision Custom Cutouts: Engineered with exact button tactility, speaker grilles, and port access without adding unnecessary bulk.
• Anti-Yellowing & Scratch Resistant: Premium UV-resistant matte finish keeps your phone looking pristine and fingerprint-free.
• Wireless Charging Ready: Ultra-slim profile seamlessly supports MagSafe & Qi wireless charging pads without removing the cover.`;
    } else if (catLower.includes("charger") || catLower.includes("power") || titleLower.includes("charger") || titleLower.includes("adapter")) {
      fallbackDesc = `• GaN Fast Charging Technology: Delivers maximum high-speed Power Delivery (PD) charging to ${targetText} up to 3x faster than standard wall bricks.
• Smart Temperature Control: Built-in intelligent chip monitors heat, prevents over-current, voltage spikes, and short-circuits.
• Universal Multi-Device Support: Compact fold-out plug design optimized for flagship smartphones, tablets, and wireless earbuds.
• 6-Month Smart Care Warranty: Certified CE/RoHS safety compliance backed by official replacement guarantee.`;
    } else if (catLower.includes("cable") || titleLower.includes("cable") || titleLower.includes("wire")) {
      fallbackDesc = `• Ultra-Durable Braided Nylon: Double-braided ballistic nylon jacket tested to withstand over 12,000+ extreme 90-degree bend cycles.
• Fast Charging & High-Speed Data Sync: Supports up to 60W Power Delivery and 480Mbps data transfer speeds for ${targetText}.
• Reinforced Strain Relief: Anti-fray aluminum casing prevents neck breakage at connector joint tips under heavy usage.
• Tangle-Free Length: Flexible, hassle-free design easy to bundle for travel, car, office, and bedside use.`;
    } else if (catLower.includes("audio") || catLower.includes("earbud") || titleLower.includes("audio") || titleLower.includes("headphone")) {
      fallbackDesc = `• Immersive HD Sound & Deep Bass: Custom 10mm dynamic drivers deliver crystal-clear highs and deep bass performance for ${targetText}.
• Passive Noise Isolation: Ergonomic silicone ear-tips seal external ambient noise for undisturbed music and crystal-clear voice calls.
• IPX5 Sweat & Water Resistance: Designed to handle intense workouts, rain splashes, and daily commuting.
• All-Day Playtime: Long-lasting battery life with quick charging support to keep your music going all day long.`;
    } else {
      fallbackDesc = `• Premium Grade Build: Crafted with high-grade durable materials specifically tailored ${targetText} for long-lasting daily use.
• Precision Fit & Engineering: Seamless compatibility with smooth tactile feel, zero signal interference, and sleek modern aesthetics.
• 100% Quality Inspected: Rigorously tested for maximum durability, heat resistance, and 6-month Smart Care warranty coverage.`;
    }

    return NextResponse.json({ success: true, description: fallbackDesc });

  } catch (error: any) {
    console.error("AI description generator error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate description" }, { status: 500 });
  }
}
