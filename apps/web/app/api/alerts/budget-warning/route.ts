import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER || "mctrackernotification@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "kmcveektvwxiqroo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, threshold, spent, limit } = body;

    const targetEmail = email || process.env.NOTIFICATION_EMAIL;
    if (!targetEmail) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
    }

    console.log(`Sending ${threshold}% Budget Warning Email to: ${targetEmail}`);

    const emailSubject = `⚠️ Budget Warning: ${threshold}% Limit Reached - MC Tracker`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #ef4444; margin-top: 0;">⚠️ MC Tracker Budget Warning Alert</h2>
        <p>Hello,</p>
        <p>Your recorded expenses for the active period have reached <strong>${threshold}%</strong> of your set budget limit.</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Active Budget Limit:</strong> ETB ${Number(limit).toFixed(2)}</p>
          <p style="margin: 6px 0;"><strong>Total Costs Spent:</strong> ETB ${Number(spent).toFixed(2)}</p>
          <p style="margin: 6px 0;"><strong>Budget Usage:</strong> ${threshold}%</p>
        </div>
        <p style="color: #64748b; font-size: 13px;">Keep track of your upcoming transactions in MC Tracker to stay within your target financial goals.</p>
      </div>
    `;

    // 1. Brevo HTTPS API (Port 443 - no port blocks on Render/Vercel, sends to any recipient)
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      const brevoFromEmail = process.env.BREVO_FROM_EMAIL || "mctrackernotification@gmail.com";
      const brevoFromName = process.env.BREVO_FROM_NAME || "MC Tracker";
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          sender: { name: brevoFromName, email: brevoFromEmail },
          to: [{ email: targetEmail }],
          subject: emailSubject,
          htmlContent: emailHtml,
        }),
      });

      const brevoData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(brevoData.message || "Brevo API error");
      }
      console.log("[Brevo] Budget warning email dispatched:", brevoData.messageId);
      return NextResponse.json({ success: true, messageId: brevoData.messageId, recipient: targetEmail, provider: "brevo" });
    }

    // 2. Resend HTTPS API (bypasses cloud SMTP port blocks on Render/Vercel)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resendFrom = process.env.RESEND_FROM || "MC Tracker <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [targetEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      const resendData = await res.json();
      if (!res.ok) {
        throw new Error(resendData.message || "Resend API error");
      }
      console.log("[Resend] Budget warning email dispatched:", resendData.id);
      return NextResponse.json({ success: true, messageId: resendData.id, recipient: targetEmail, provider: "resend" });
    }

    // 2. Fallback to nodemailer SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"MC Tracker Alerts" <${EMAIL_USER}>`,
      to: targetEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("[Gmail SMTP] Email dispatched successfully:", info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId, recipient: targetEmail, provider: "smtp" });
  } catch (error: any) {
    console.error("[Gmail SMTP Error]:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
