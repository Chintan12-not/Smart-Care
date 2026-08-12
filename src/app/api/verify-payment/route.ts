import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required Razorpay payment verification parameters." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay Key Secret is missing in server environment." },
        { status: 500 }
      );
    }

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
