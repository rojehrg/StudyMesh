import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: "beta-request" });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, companySize, role, blocker } = body;

    // Validate required fields
    if (!email?.trim() || !companySize || !role) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = await createClient();

    // Check for existing request
    const { data: existing } = await supabase
      .from("beta_requests")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: "You're already on the list!",
        alreadyExists: true,
      });
    }

    // Insert new request
    const { error } = await supabase.from("beta_requests").insert({
      email: normalizedEmail,
      company_size: companySize,
      role,
      blocker: blocker?.trim() || null,
    });

    if (error) {
      log.error("Failed to insert beta request", { error: error.message });
      return NextResponse.json(
        { ok: false, error: "Failed to save request" },
        { status: 500 }
      );
    }

    // Send email notification (fire and forget)
    sendEmailNotification({ email: normalizedEmail, companySize, role, blocker })
      .catch((err) => log.error("Email notification failed", { error: err.message }));

    log.info("Beta request created", { email: normalizedEmail });
    return NextResponse.json({ ok: true, message: "You're on the list!" });
  } catch (error: any) {
    log.error("Beta request error", { error: error.message });
    return NextResponse.json(
      { ok: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

async function sendEmailNotification(data: {
  email: string;
  companySize: string;
  role: string;
  blocker?: string;
}) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const notifyEmail = process.env.BETA_NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    log.info("Skipping email notification: MAILERSEND_API_KEY or BETA_NOTIFY_EMAIL not set");
    return;
  }

  const fromEmail = process.env.MAILERSEND_FROM_EMAIL || "notifications@attunly.com";
  const fromName = process.env.MAILERSEND_FROM_NAME || "Attunly";

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://attunly.com";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Georgia', serif; background-color: #faf8f5; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="max-width: 500px; background: #fffdf9; border-radius: 16px; overflow: hidden; border: 1px solid #e8e4dc;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background: #1a1614; text-align: center;">
              <span style="font-size: 18px; font-weight: 600; color: #fffdf9;">New Beta Request</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e8e4dc;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #8b7355;">Email</span><br/>
                    <span style="font-size: 16px; color: #1a1614; font-weight: 500;">${data.email}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e8e4dc;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #8b7355;">Company Size</span><br/>
                    <span style="font-size: 16px; color: #1a1614;">${data.companySize} employees</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e8e4dc;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #8b7355;">Role</span><br/>
                    <span style="font-size: 16px; color: #1a1614;">${data.role}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #8b7355;">Blocker</span><br/>
                    <span style="font-size: 15px; color: #5c4a3a; line-height: 1.5;">${data.blocker || "Not provided"}</span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 24px; text-align: center;">
                <a href="${APP_URL}/admin/beta-requests" style="display: inline-block; background: #1a1614; color: #fffdf9; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">View All Requests</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: notifyEmail }],
      subject: `🎉 Beta: ${data.email} (${data.companySize}, ${data.role})`,
      html,
    }),
  });
}
