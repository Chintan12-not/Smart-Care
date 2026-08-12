import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, category, brand, targetModel } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    const prompt = `Write a high-converting, professional, 3-bullet-point product description for a mobile accessory.
Product Title: "${name}"
Category: "${category || "Mobile Accessory"}"
Brand: "${brand || "Universal"}"
Compatible Model: "${targetModel || "All standard models"}"

Format requirements:
- Return ONLY 3 clean bullet points (starting with •).
- Highlight build quality, shock protection/fast charging efficiency, scratch resistance, and perfect fit.
- Keep it sleek, premium, and concise (under 80 words).`;

    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("PASTE_")) {
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({ success: true, description: generatedText.trim() });
          }
        }
      } catch (aiErr) {
        console.warn("[AI Generate Description Error, fallback active]", aiErr);
      }
    }

    // Smart fallback description generator
    const modelText = targetModel ? ` specifically engineered for ${targetModel}` : ` compatible with ${brand} smartphones`;
    const fallbackDesc = `• Premium Grade Build: Crafted with military-grade durable materials${modelText} for long-lasting protection.
• Precision Engineering: Perfect cutouts for buttons, speakers, and charging ports with zero signal interference.
• 100% Quality Guaranteed: Tested for extreme durability, fast performance, and 6-month Smart Care warranty coverage.`;

    return NextResponse.json({ success: true, description: fallbackDesc });

  } catch (error: any) {
    console.error("AI description generator error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate description" }, { status: 500 });
  }
}
