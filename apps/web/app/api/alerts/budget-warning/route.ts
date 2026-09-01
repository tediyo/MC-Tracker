import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER || "tewodrosberhanu19@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "nbloosgfbxsvfyux";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, threshold, spent, limit } = body;

    const targetEmail = email || process.env.NOTIFICATION_EMAIL || "tewodrosberhanu16@gmail.com";

    console.log(`[Gmail SMTP] Sending ${threshold}% Budget Warning Email to: ${targetEmail}`);

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
      subject: `⚠️ Budget Warning: ${threshold}% Limit Reached - MC Tracker`,
      html: `
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
      `,
    });

    console.log("[Gmail SMTP] Email dispatched successfully:", info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId, recipient: targetEmail });
  } catch (error: any) {
    console.error("[Gmail SMTP Error]:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
