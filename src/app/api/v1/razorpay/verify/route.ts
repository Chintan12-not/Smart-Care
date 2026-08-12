import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required Razorpay payment verification parameters." },
        { status: 400 }
      );
    }

    // Check if Cloudflare Backend Proxy is configured
    const cfBackendUrl = process.env.CLOUDFLARE_RAZORPAY_BACKEND_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_RAZORPAY_BACKEND_URL;
    if (cfBackendUrl) {
      try {
        const cfResponse = await fetch(`${cfBackendUrl.replace(/\/$/, "")}/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const cfData = await cfResponse.json();
        return NextResponse.json(cfData, { status: cfResponse.status });
      } catch (cfErr: any) {
        console.error("[Cloudflare Razorpay Verify Proxy Error]:", cfErr);
      }
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "8aD2Kd9Fr55IM6AiHW17GXXU";

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (isSignatureValid) {
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully.",
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      });
    } else {
      console.warn("[Razorpay Verification Failed] Signature mismatch.");
      return NextResponse.json(
        { success: false, error: "Payment verification failed: Invalid signature." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Razorpay Verify Exception]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error during verification." },
      { status: 500 }
    );
  }
}
