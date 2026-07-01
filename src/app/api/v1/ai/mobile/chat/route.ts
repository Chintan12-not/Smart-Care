import { NextResponse } from "next/server";
import { askMobileAssistant } from "@/lib/gemini";

/**
 * POST /api/v1/ai/mobile/chat
 * Request body: { message: string }
 */
export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required", data: null },
        { status: 400 }
      );
    }

    const response = await askMobileAssistant(message);

    return NextResponse.json({
      success: true,
      data: {
        message: response,
      },
      error: null,
    });
  } catch (error: any) {
    console.error("Mobile Assistant API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process diagnostic query", data: null },
      { status: 500 }
    );
  }
}
