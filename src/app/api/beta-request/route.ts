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

    // Send emails (fire and forget)
    sendEmailNotification({ email: normalizedEmail, companySize, role, blocker })
      .catch((err) => log.error("Email notification failed", { error: err.message }));

    sendConfirmationEmail(normalizedEmail)
      .catch((err) => log.error("Confirmation email failed", { error: err.message }));

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
<body style="font-family: Georgia, 'Times New Roman', serif; background-color: #faf8f5; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf8f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background: #fffdf9; border-radius: 16px; overflow: hidden; border: 1px solid #e8e4dc;">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e8e4dc;">
              <img src="https://attunly.com/icon.png" alt="Attunly" width="48" height="48" style="display: block; margin: 0 auto 16px;" />
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1614;">New Beta Request</h1>
              <p style="margin: 8px 0 0; font-size: 15px; color: #6b5d54;">Someone wants early access to Attunly</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 16px; background: #f6f3f0; border-radius: 12px; margin-bottom: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e8e4dc;">
                          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8b7355; display: block; margin-bottom: 4px;">Email</span>
                          <span style="font-size: 16px; color: #1a1614; font-weight: 600;">${data.email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e8e4dc;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="50%" style="vertical-align: top;">
                                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8b7355; display: block; margin-bottom: 4px;">Company Size</span>
                                <span style="font-size: 15px; color: #1a1614;">${data.companySize}</span>
                              </td>
                              <td width="50%" style="vertical-align: top;">
                                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8b7355; display: block; margin-bottom: 4px;">Role</span>
                                <span style="font-size: 15px; color: #1a1614;">${data.role}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px;">
                          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8b7355; display: block; margin-bottom: 4px;">What blocks them from getting help</span>
                          <span style="font-size: 15px; color: #4a3f38; line-height: 1.5;">${data.blocker || "Not provided"}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/admin/beta-requests" style="display: inline-block; background: #1a1614; color: #fffdf9; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">View All Requests</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #f6f3f0; text-align: center; border-top: 1px solid #e8e4dc;">
              <p style="margin: 0; font-size: 13px; color: #8b7355;">You're receiving this because someone requested beta access at attunly.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const response = await fetch("https://api.mailersend.com/v1/email", {
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

  if (!response.ok) {
    const errorText = await response.text();
    log.error("MailerSend API error", { status: response.status, error: errorText, to: notifyEmail });
  } else {
    log.info("Beta notification email sent", { to: notifyEmail, beta_email: data.email });
  }
}

async function sendConfirmationEmail(email: string) {
  const apiKey = process.env.MAILERSEND_API_KEY;

  if (!apiKey) {
    log.info("Skipping confirmation email: MAILERSEND_API_KEY not set");
    return;
  }

  const fromEmail = process.env.MAILERSEND_FROM_EMAIL || "notifications@attunly.com";
  const fromName = process.env.MAILERSEND_FROM_NAME || "Attunly";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, 'Times New Roman', serif; background-color: #faf8f5; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf8f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background: #fffdf9; border-radius: 16px; overflow: hidden; border: 1px solid #e8e4dc;">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e8e4dc;">
              <img src="https://attunly.com/icon.png" alt="Attunly" width="48" height="48" style="display: block; margin: 0 auto 16px;" />
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1614;">You're on the list</h1>
              <p style="margin: 8px 0 0; font-size: 15px; color: #6b5d54;">Thanks for requesting early access to Attunly</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #4a3f38; line-height: 1.6;">
                We're building something that makes it easy for teams to share knowledge without interrupting each other.
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; color: #4a3f38; line-height: 1.6;">
                We're letting people in gradually to make sure everything works smoothly. We'll reach out when your spot is ready.
              </p>
              <p style="margin: 0; font-size: 16px; color: #4a3f38; line-height: 1.6;">
                In the meantime, feel free to reply to this email if you have any questions.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #f6f3f0; text-align: center; border-top: 1px solid #e8e4dc;">
              <p style="margin: 0; font-size: 13px; color: #8b7355;">Attunly · Knowledge that flows</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email }],
      subject: "You're on the Attunly beta list",
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    log.error("MailerSend confirmation error", { status: response.status, error: errorText, to: email });
  } else {
    log.info("Beta confirmation email sent", { to: email });
  }
}
