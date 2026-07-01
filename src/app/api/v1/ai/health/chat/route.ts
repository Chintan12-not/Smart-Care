import { NextResponse } from "next/server";
import { askHealthAssistant } from "@/lib/gemini";

/**
 * POST /api/v1/ai/health/chat
 * Request body: { message: string, language: string }
 */
export async function POST(request: Request) {
  try {
    const { message, language = "en" } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required", data: null },
        { status: 400 }
      );
    }

    const response = await askHealthAssistant(message, language);

    return NextResponse.json({
      success: true,
      data: {
        message: response,
      },
      error: null,
    });
  } catch (error: any) {
    console.error("Health Assistant API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process chat", data: null },
      { status: 500 }
    );
  }
}
