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
      subject = "Thank You for Joining Smart Care & Mobile Point!";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #10b981;">
            <img src="https://smartcaremobile.in/logo.png" alt="Smart Care & Mobile Point Logo" style="width: 180px; height: auto;" />
          </div>
          <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Thank You for Joining Us, ${payload.name || "Valued Customer"}! 🎉</h2>
          <p style="font-size: 14px; color: #475569;">Welcome to <strong>Smart Care & Mobile Point</strong> — Gurugram's #1 Doorstep Mobile Repair & Genuine Accessories Store!</p>
          <p style="font-size: 14px; color: #475569;">Your account is now fully active. You can now log into your dashboard anytime to access exclusive customer benefits:</p>
          
          <div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid #cbd5e1;">
            <h4 style="margin: 0 0 10px 0; color: #10b981; font-size: 14px;">Your Member Privileges:</h4>
            <ul style="padding-left: 20px; margin: 0; font-size: 13px; color: #334155;">
              <li style="margin-bottom: 8px;"><strong>45-Minute Doorstep Mobile Repair</strong>: Free pickup & delivery across all Gurugram sectors.</li>
              <li style="margin-bottom: 8px;"><strong>Genuine Phone Accessories</strong>: Covers, 9H tempered glass, and fast chargers for 600+ models.</li>
              <li style="margin-bottom: 8px;"><strong>Document Printing & Xerox</strong>: In-store express document services at Shop No. 28, Ninex Residency.</li>
              <li style="margin-bottom: 0;"><strong>Corporate Bulk Discounts</strong>: Direct wholesale rates with 100% GST invoices.</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://smartcaremobile.in/dashboard" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">Go to Customer Dashboard</a>
          </div>

          <p style="font-size: 13px; color: #64748b;">Need assistance or repair advice? Chat directly with our certified technicians on <a href="https://wa.me/919289942313" style="color: #10b981; text-decoration: none; font-weight: bold;">WhatsApp (+91 92899 42313)</a>.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Smart Care & Mobile Point | Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</p>
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
    } else if (type === "delivered") {
      subject = `Order Delivered! Thank You - #${payload.order_id || "ORD"}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #10b981;">
            <img src="https://smartcaremobile.in/logo.png" alt="Smart Care & Mobile Point Logo" style="width: 180px; height: auto;" />
          </div>
          <h2 style="color: #10b981; margin-top: 0; font-size: 22px;">Order Delivered Successfully! 🎉</h2>
          <p style="font-size: 14px; color: #475569;">Dear <strong>${payload.customerName || payload.shippingAddress?.name || "Valued Customer"}</strong>,</p>
          <p style="font-size: 14px; color: #475569;">Your order <strong>#${payload.order_id}</strong> has been successfully delivered to your address!</p>
          
          <div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid #cbd5e1;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155;"><strong>Delivered To:</strong> ${payload.shippingAddress?.address || ""}, ${payload.shippingAddress?.city || ""}</p>
            <p style="margin: 0; font-size: 13px; color: #10b981; font-weight: bold;">Grand Total Paid: ₹${payload.total_amount}</p>
          </div>

          <p style="font-size: 14px; color: #475569; font-weight: bold; text-align: center;">
            Thank you for ordering with Smart Care & Mobile Point! We hope you love your new products. See you next time and keep ordering! 📱✨
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://smartcaremobile.in/accessories" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">Shop More Accessories</a>
          </div>

          <p style="font-size: 13px; color: #64748b;">Have feedback or need support? Reply to this email or chat with us on <a href="https://wa.me/919289942313" style="color: #10b981; text-decoration: none; font-weight: bold;">WhatsApp (+91 92899 42313)</a>.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Smart Care & Mobile Point | Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</p>
        </div>
      `;
    } else {
      return NextResponse.json({ success: false, error: "Invalid email type" }, { status: 400 });
    }

    // Build recipient targets based on email type:
    // - "welcome": ONLY send to the customer email [to]
    // - "accessory" or "pickup": send to customer email [to] AND store owners [enigcon2020@gmail.com, chintanmaheshwari714@gmail.com]
    const recipientTargets = (type === "welcome" || type === "delivered") 
      ? [to] 
      : Array.from(new Set([to, ...adminRecipients]));

    if (isMock) {
      console.log(`[Resend Mock Email] Simulating ${type} email to: ${recipientTargets.join(", ")}`);
      return NextResponse.json({
        success: true,
        message: "Email simulated successfully (Mock Mode active).",
        recipients: recipientTargets,
        mocked: true
      });
    }

    const resend = new Resend(apiKey);
    
    console.log(`[Email API] Sending ${type} email via Resend to: ${recipientTargets.join(", ")}`);
    
    const result = await resend.emails.send({
      from: type === "welcome" ? "Smart Care <welcome@smartcaremobile.in>" : "Smart Care Orders <orders@smartcaremobile.in>",
      to: recipientTargets,
      subject: type === "accessory" || type === "pickup" ? `[NEW ORDER] ${subject}` : subject,
      html: htmlContent,
    }) as any;

    if (result.error) {
      // Fallback to onboarding@resend.dev if custom domain DNS is not yet verified in Resend
      console.warn("[Email API] Primary domain email failed, attempting onboarding@resend.dev fallback:", result.error);
      const fallbackResult = await resend.emails.send({
        from: "Smart Care <onboarding@resend.dev>",
        to: recipientTargets,
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
