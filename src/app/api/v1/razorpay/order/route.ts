import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt } = body;

    // Check if Cloudflare Backend Proxy is configured
    const cfBackendUrl = process.env.CLOUDFLARE_RAZORPAY_BACKEND_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_RAZORPAY_BACKEND_URL;
    if (cfBackendUrl) {
      try {
        const cfResponse = await fetch(`${cfBackendUrl.replace(/\/$/, "")}/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const cfData = await cfResponse.json();
        return NextResponse.json(cfData, { status: cfResponse.status });
      } catch (cfErr: any) {
        console.error("[Cloudflare Razorpay Proxy Error]:", cfErr);
        // Fallback to Vercel native Razorpay if Cloudflare worker call fails
      }
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TOsdFkVaG73hSI";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "8aD2Kd9Fr55IM6AiHW17GXXU";

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
