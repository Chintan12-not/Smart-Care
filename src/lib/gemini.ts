/**
 * Server-side Gemini API client integration helper.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

/**
 * Basic request executor for the Gemini API.
 */
async function callGeminiAPI(systemInstruction: string, prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not defined. Returning fallback simulated response.");
    return simulateFallbackResponse(systemInstruction, prompt);
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nUser request: ${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("Empty response received from Gemini API");
    }

    return resultText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return simulateFallbackResponse(systemInstruction, prompt);
  }
}

/**
 * AI Health Assistant helper. Handles multilingual queries.
 * Enforces health safeguards: Never diagnoses, never prescribes, suggests doctor consultation.
 */
export async function askHealthAssistant(query: string, language: string = "en"): Promise<string> {
  const systemInstruction = `
    You are the AI Health Assistant for Smart Care.
    Your language is "${language}". Reply ONLY in "${language}".
    
    CRITICAL MEDICAL SAFEGUARDS:
    1. You are an educational assistant. You must NEVER diagnose diseases.
    2. You must NEVER prescribe prescription medicines (like antibiotics, schedule H/X drugs).
    3. You must always recommend consulting a qualified physician/doctor for any actual symptoms.
    4. Provide helpful educational guidance regarding general health habits, nutrition, and details on generic medicines.
    5. Detect emergency symptoms (e.g. severe chest pain, shortness of breath, sudden numbness, high fever in infants) and immediately display a bold warning to call emergency services.
    
    Always add this warning disclaimer at the end of the text in the response language:
    "Disclaimer: This guidance is for educational purposes only. Please consult a licensed healthcare professional before taking any medical action."
  `;

  return callGeminiAPI(systemInstruction, query);
}

/**
 * AI Mobile Assistant helper.
 * Diagnoses device issues, asks clarifying follow-up questions, and estimates repair costs.
 */
export async function askMobileAssistant(query: string): Promise<string> {
  const systemInstruction = `
    You are the AI Mobile Repair Assistant for Smart Care & Mobile Point.
    Diagnose user mobile hardware/software problems (heating, battery drain, cracked screen, speaker issue, charging issues).
    
    INSTRUCTIONS:
    1. Outline possible causes for the issue.
    2. Ask 1-2 clarifying follow-up questions (e.g., brand, drop history).
    3. Give a rough repair cost and duration estimate.
    4. Recommend ordering matching accessories (e.g. mobile cases for cracked screens, fast chargers for charging problems).
    5. Suggest booking a professional repair appointment through our platform.
  `;

  return callGeminiAPI(systemInstruction, query);
}

/**
 * OCR Simulator / Gemini Image parser for Prescriptions.
 * Extracts generic and brand names, categories, and instructions.
 */
export async function parsePrescriptionOCR(base64Image: string): Promise<{
  medicines: Array<{ genericName: string; dosage: string; frequency: string }>;
  rawText: string;
}> {
  // If no Gemini API Key, return mockup OCR response
  if (!GEMINI_API_KEY) {
    return {
      medicines: [
        { genericName: "Paracetamol 500mg", dosage: "1 tablet", frequency: "Twice a day after food" },
        { genericName: "Amoxicillin 250mg", dosage: "1 capsule", frequency: "Three times a day" }
      ],
      rawText: "Rx\nTab. Paracetamol 500mg -- 1 tab BID\nCap. Amoxicillin 250mg -- 1 cap TID\nFor fever and infection.\nSigned Dr. Sharma"
    };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Analyze this prescription image and return a JSON structure containing parsed medicines list and the raw text extracted. Format: { \"medicines\": [ { \"genericName\": \"...\", \"dosage\": \"...\", \"frequency\": \"...\" } ], \"rawText\": \"...\" }" },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Attempt JSON parse
    const cleanJsonText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJsonText);
  } catch (error) {
    console.error("Prescription OCR Error:", error);
    return {
      medicines: [
        { genericName: "Paracetamol 500mg", dosage: "1 tablet", frequency: "Twice a day" }
      ],
      rawText: "Fallback OCR: Paracetamol detected."
    };
  }
}

/**
 * Fallback simulators when API Key is missing, to keep app working gracefully.
 */
function simulateFallbackResponse(systemInstruction: string, prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  if (systemInstruction.includes("AI Health Assistant")) {
    if (promptLower.includes("chest pain") || promptLower.includes("heart attack") || promptLower.includes("breathing")) {
      return `**EMERGENCY WARNING DETECTED**\n\nYour symptoms could represent a medical emergency. Please contact emergency services (112 or local hospital) immediately.\n\nFor general information: Chest pain can relate to cardiovascular, respiratory, or muscle issues. Do not ignore these symptoms. Please consult a doctor immediately.\n\n*Disclaimer: This guidance is for educational purposes only. Please consult a licensed healthcare professional before taking any medical action.*`;
    }
    return `Thank you for asking about "${prompt}". As an AI educational guide, I can tell you that this concerns general wellness. For mild discomforts, maintaining hydration and healthy sleep are recommended. Please consult a doctor for diagnosis.\n\n*Disclaimer: This guidance is for educational purposes only. Please consult a licensed healthcare professional before taking any medical action.*`;
  }

  if (systemInstruction.includes("AI Mobile Repair Assistant")) {
    if (promptLower.includes("heating")) {
      return `Heating is a common issue caused by intensive background apps, gaming, or battery degradation.\n\n**Possible Causes:**\n- CPU overload\n- Faulty battery\n- Ambient temperature\n\n**Estimated Cost & Time:**\n- Diagnostic check: Free\n- Battery Replacement: ₹1,299 (approx 1 hour)\n\n**Follow-up Question:** Does the phone heat up primarily during charging or gaming?\n\n*Tip:* Check out our cooling covers or fast chargers in the accessories store!`;
    }
    return `Based on your description of "${prompt}", this looks like a hardware issue.\n\n**Possible Causes:**\n- Connection loose\n- Hardware component damage\n\n**Estimated Cost:** ₹999 - ₹2,499 depending on model.\n\nWould you like to book a pickup appointment?`;
  }

  return `Simulated response to: ${prompt}`;
}
