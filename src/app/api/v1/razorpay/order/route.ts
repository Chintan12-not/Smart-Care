import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", receipt } = await req.json();

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TOiFZDDTMcDv2P";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "ASOrWRvNHOQJ5d1BYf2lzTOc";

    // Convert INR to Paise if provided in INR, or ensure minimum 100 paise
    const amountInPaise = Number(amount) < 100 ? Math.round(Number(amount) * 100) : Math.round(Number(amount));

    if (amountInPaise < 100) {
      return NextResponse.json(
        { success: false, error: "Minimum order amount is 100 paise (₹1)." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderOptions = {
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        merchant: "Smart Care & Mobile Point",
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      order,
      keyId,
    });
  } catch (error: any) {
    console.error("[Razorpay Create Order Error]:", error);
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error.description || error.message || "Failed to create Razorpay order" },
      { status: statusCode }
    );
  }
}
