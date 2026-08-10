import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { type, to, payload } = await req.json();

    if (!to) {
      return NextResponse.json({ success: false, error: "Recipient email is required" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY || "";
    const isMock = !apiKey || apiKey.startsWith("PASTE_") || apiKey.startsWith("re_mock");

    console.log(`[Email API] type=${type}, to=${to}, isMock=${isMock}, hasKey=${!!apiKey}`);

    // Format email content based on type
    let subject = "";
    let htmlContent = "";

    if (type === "welcome") {
      subject = "Welcome to Smart Care & Mobile Point!";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://smart-care-u57t.vercel.app/logo.png" alt="Smart Care Logo" style="width: 150px; height: auto;" />
          </div>
          <h2 style="color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 8px;">Welcome to Smart Care, ${payload.name || "friend"}!</h2>
          <p>Thank you for signing up for an account on Smart Care & Mobile Point. We are excited to have you join our platform!</p>
          <p>With your account, you can now:</p>
          <ul style="padding-left: 20px;">
            <li><strong>Schedule Doorstep Pickups</strong>: Professional repair logistics inside Gurugram.</li>
            <li><strong>Live Tracking</strong>: View your repair bookings status live in your customer dashboard.</li>
            <li><strong>Order Accessories</strong>: Browse and buy premium products.</li>
            <li><strong>AI Assistant</strong>: Use our mobile diagnostics checker anytime.</li>
          </ul>
          <p>If you have any questions or need immediate assistance, reply to this email or chat with us on WhatsApp at +91 9289942313.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #777; text-align: center;">Smart Care Hub, Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</p>
        </div>
      `;
    } else if (type === "pickup") {
      subject = "Doorstep Pickup Request Registered - Smart Care";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://smart-care-u57t.vercel.app/logo.png" alt="Smart Care Logo" style="width: 150px; height: auto;" />
          </div>
          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 8px;">Pickup Booking Confirmed!</h2>
          <p>Dear ${payload.customerName},</p>
          <p>Thank you for choosing Smart Care. We have successfully registered your doorstep pickup request.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 12px; margin: 20px 0; font-size: 14px; border: 1px solid #eee;">
            <p style="margin: 0 0 8px 0;"><strong>Device Details:</strong> ${payload.deviceBrand} ${payload.deviceModel}</p>
            <p style="margin: 0 0 8px 0;"><strong>Preferred Schedule:</strong> ${payload.preferredDate} (${payload.preferredTime})</p>
            <p style="margin: 0 0 8px 0;"><strong>Pickup Address:</strong> ${payload.pickupAddress}</p>
            <p style="margin: 0 0 8px 0;"><strong>Estimated Distance:</strong> ${payload.distanceKm} km</p>
            <p style="margin: 0;"><strong>Pickup & Drop Fee:</strong> ${payload.pickupCharge === 0 ? "FREE" : `₹${payload.pickupCharge}`}</p>
          </div>

          <p>Our dispatch team is processing your request, and a service agent will contact you shortly to coordinate the pickup.</p>
          <p>You can track this booking status live under the "Repairs" tab in your <a href="https://smart-care-u57t.vercel.app/dashboard/repairs" style="color: #06b6d4; text-decoration: none; font-weight: bold;">customer dashboard</a>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #777; text-align: center;">Smart Care Hub, Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</p>
        </div>
      `;
    } else if (type === "accessory") {
      subject = "Order Confirmed - Smart Care Accessories";
      const itemsHtml = payload.items.map((item: any) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 0; font-size: 13px;">
            <strong>${item.product_name || item.name}</strong><br/>
            Qty: ${item.quantity}
          </td>
          <td style="padding: 10px 0; text-align: right; font-size: 13px;">₹${item.price * item.quantity}</td>
        </tr>
      `).join("");

      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://smart-care-u57t.vercel.app/logo.png" alt="Smart Care Logo" style="width: 150px; height: auto;" />
          </div>
          <h2 style="color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 8px;">Accessory Purchase Confirmation</h2>
          <p>Thank you for your order, ${payload.shippingAddress.name}!</p>
          <p>We are preparing your items for delivery. Below is your order summary:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; text-align: left;">
                <th style="padding: 10px 0; font-size: 12px; text-transform: uppercase; color: #777;">Item Details</th>
                <th style="padding: 10px 0; text-align: right; font-size: 12px; text-transform: uppercase; color: #777;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td style="padding: 15px 0 5px 0; font-size: 14px; font-weight: bold;">Grand Total:</td>
                <td style="padding: 15px 0 5px 0; text-align: right; font-size: 14px; font-weight: bold; color: #10b981;">₹${payload.total_amount}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 12px; margin: 20px 0; font-size: 13px; border: 1px solid #eee;">
            <h4 style="margin: 0 0 10px 0; color: #06b6d4;">Delivery Address:</h4>
            <p style="margin: 0;">${payload.shippingAddress.address}, ${payload.shippingAddress.city} - ${payload.shippingAddress.pincode}</p>
            <p style="margin: 5px 0 0 0;">Phone: ${payload.shippingAddress.phone}</p>
          </div>

          <p>You can view your order tracking details under the "Orders" tab in your <a href="https://smart-care-u57t.vercel.app/dashboard/orders" style="color: #06b6d4; text-decoration: none; font-weight: bold;">customer dashboard</a>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #777; text-align: center;">Smart Care Hub, Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</p>
        </div>
      `;
    } else {
      return NextResponse.json({ success: false, error: "Invalid email type" }, { status: 400 });
    }

    if (isMock) {
      console.log(`[Resend Mock Email] Sending ${type} email to: ${to}`);
      console.log(`[Subject]: ${subject}`);
      return NextResponse.json({
        success: true,
        message: "Email simulated successfully (Mock Mode active).",
        mocked: true
      });
    }

    const resend = new Resend(apiKey);
    
    console.log(`[Email API] Sending ${type} email via Resend to: ${to}`);
    
    const result = await resend.emails.send({
      from: "Smart Care <onboarding@resend.dev>",
      to,
      subject,
      html: htmlContent,
    }) as any;

    if (result.error) {
      const errMsg = typeof result.error === "object" ? JSON.stringify(result.error) : String(result.error);
      console.error("[Email API] Resend API error:", errMsg);
      // Return success:false with full error detail
      return NextResponse.json({ 
        success: false, 
        error: errMsg,
        hint: "With Resend free plan using onboarding@resend.dev, you can only send to your Resend account's verified email. Add a custom domain in Resend dashboard to send to any email."
      }, { status: 500 });
    }

    console.log(`[Email API] Email sent successfully! ID: ${result.data?.id}`);
    return NextResponse.json({ success: true, id: result.data?.id });

  } catch (error: any) {
    console.error("[Email API] Route failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
