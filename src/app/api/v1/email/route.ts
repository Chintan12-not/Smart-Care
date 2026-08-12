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

    let subject = "";
    let htmlContent = "";

    const adminRecipients = ["enigcon2020@gmail.com", "chintanmaheshwari714@gmail.com"];

    if (type === "welcome") {
      subject = "Welcome to Smart Care & Mobile Point!";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://smartcaremobile.in/logo.png" alt="Smart Care Logo" style="width: 150px; height: auto;" />
          </div>
          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 8px;">Welcome to Smart Care, ${payload.name || "friend"}!</h2>
          <p>Thank you for signing up for an account on Smart Care & Mobile Point. We are excited to have you join our platform!</p>
          <p>With your account, you can now:</p>
          <ul style="padding-left: 20px;">
            <li><strong>Schedule Doorstep Pickups</strong>: Professional repair logistics inside Gurugram.</li>
            <li><strong>Live Tracking</strong>: View your repair bookings status live in your customer dashboard.</li>
            <li><strong>Order Accessories</strong>: Browse and buy premium products with doorstep shipping.</li>
            <li><strong>AI Assistant</strong>: Use our mobile diagnostics checker anytime.</li>
          </ul>
          <p>If you have any questions or need immediate assistance, reply to this email or chat with us on WhatsApp at +91 9289942313.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #777; text-align: center;">Smart Care Hub, Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</p>
        </div>
      `;
    } else if (type === "pickup") {
      subject = `Doorstep Pickup Request Registered - #${payload.bookingId || "SRV"}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://smartcaremobile.in/logo.png" alt="Smart Care Logo" style="width: 150px; height: auto;" />
          </div>
          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 8px;">Doorstep Pickup Booking Confirmed!</h2>
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
          <p>You can track this booking status live under the "Repairs" tab in your <a href="https://smartcaremobile.in/dashboard/repairs" style="color: #10b981; text-decoration: none; font-weight: bold;">customer dashboard</a>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #777; text-align: center;">Smart Care Hub, Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</p>
        </div>
      `;
    } else if (type === "accessory") {
      subject = `Order Confirmed - #${payload.order_id || "ORD"}`;
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
            <img src="https://smartcaremobile.in/logo.png" alt="Smart Care Logo" style="width: 150px; height: auto;" />
          </div>
          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 8px;">Order Confirmation - #${payload.order_id}</h2>
          <p>Thank you for ordering with Smart Care & Mobile Point, ${payload.shippingAddress.name}!</p>
          <p>We have registered your order and are preparing your items for delivery. Below is your complete order summary and shipping details:</p>

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
                <td style="padding: 10px 0 5px 0; font-size: 13px;">Items Subtotal:</td>
                <td style="padding: 10px 0 5px 0; text-align: right; font-size: 13px;">₹${payload.subtotal || payload.total_amount}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-size: 13px;">Shipping Charges (${payload.shipping_charge === 50 ? "Gurugram Express ₹50" : "Standard ₹120"}):</td>
                <td style="padding: 5px 0; text-align: right; font-size: 13px; color: #10b981; font-weight: bold;">₹${payload.shipping_charge || 0}</td>
              </tr>
              <tr style="border-top: 2px solid #eee;">
                <td style="padding: 12px 0 5px 0; font-size: 15px; font-weight: bold;">Grand Total:</td>
                <td style="padding: 12px 0 5px 0; text-align: right; font-size: 15px; font-weight: bold; color: #10b981;">₹${payload.total_amount}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 12px; margin: 20px 0; font-size: 13px; border: 1px solid #eee;">
            <h4 style="margin: 0 0 10px 0; color: #10b981;">Shipping Address:</h4>
            <p style="margin: 0;"><strong>${payload.shippingAddress.name}</strong></p>
            <p style="margin: 5px 0 0 0;">${payload.shippingAddress.address}, ${payload.shippingAddress.city} - ${payload.shippingAddress.pincode}</p>
            <p style="margin: 5px 0 0 0;">Phone: ${payload.shippingAddress.phone}</p>
            <p style="margin: 5px 0 0 0;">Email: ${payload.shippingAddress.email || to}</p>
            <p style="margin: 5px 0 0 0;">Payment Method: ${payload.payment_method}</p>
          </div>

          <p>You will receive live tracking updates on your email and under the "Orders" tab in your <a href="https://smartcaremobile.in/dashboard/orders" style="color: #10b981; text-decoration: none; font-weight: bold;">customer dashboard</a>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #777; text-align: center;">Smart Care Hub, Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</p>
        </div>
      `;
    } else {
      return NextResponse.json({ success: false, error: "Invalid email type" }, { status: 400 });
    }

    // Build recipient targets (Customer + Admins enigcon2020@gmail.com and chintanmaheshwari714@gmail.com)
    const allRecipients = Array.from(new Set([to, ...adminRecipients]));

    if (isMock) {
      console.log(`[Resend Mock Email] Simulating email to: ${allRecipients.join(", ")}`);
      return NextResponse.json({
        success: true,
        message: "Email simulated successfully (Mock Mode active).",
        recipients: allRecipients,
        mocked: true
      });
    }

    const resend = new Resend(apiKey);
    
    console.log(`[Email API] Sending ${type} email via Resend to: ${allRecipients.join(", ")}`);
    
    const result = await resend.emails.send({
      from: "Smart Care Orders <orders@smartcaremobile.in>",
      to: allRecipients,
      subject: type === "accessory" || type === "pickup" ? `[NEW ORDER] ${subject}` : subject,
      html: htmlContent,
    }) as any;

    if (result.error) {
      // Fallback to onboarding@resend.dev if domain DNS is not yet verified in Resend
      console.warn("[Email API] Primary domain email failed, attempting onboarding@resend.dev fallback:", result.error);
      const fallbackResult = await resend.emails.send({
        from: "Smart Care <onboarding@resend.dev>",
        to: allRecipients,
        subject: type === "accessory" || type === "pickup" ? `[NEW ORDER] ${subject}` : subject,
        html: htmlContent,
      }) as any;

      if (fallbackResult.error) {
        const errMsg = typeof fallbackResult.error === "object" ? JSON.stringify(fallbackResult.error) : String(fallbackResult.error);
        console.error("[Email API] Resend API error:", errMsg);
        return NextResponse.json({ 
          success: false, 
          error: errMsg,
          hint: "Connect custom domain smartcaremobile.in in Resend Dashboard (https://resend.com/domains) to enable active email sending."
        }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: fallbackResult.data?.id, note: "Sent via onboarding fallback" });
    }

    console.log(`[Email API] Email sent successfully! ID: ${result.data?.id}`);
    return NextResponse.json({ success: true, id: result.data?.id });

  } catch (error: any) {
    console.error("[Email API] Route failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
