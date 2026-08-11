import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", receipt } = await req.json();

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TO6v5XghH0VsgN";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "01pRfUOj0e5R5iks6sPKNdzw";

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const amountInPaise = Math.round(Number(amount) * 100);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          merchant: "Smart Care Mobile Store",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Razorpay API Error]", data);
      return NextResponse.json(
        { success: false, error: data.error?.description || "Failed to create Razorpay order" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      order: data,
      keyId,
    });
  } catch (error: any) {
    console.error("[Razorpay Order Exception]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
