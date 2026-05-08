import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


def send_password_reset_email(to_email: str, to_name: str, reset_link: str) -> None:
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:#1e293b;padding:32px 40px;">
                <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">
                  GradMatch AI
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">
                  Reset your password
                </p>
                <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                  Hi {to_name}, we received a request to reset the password for your GradMatch AI account.
                  Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
                </p>

                <!-- CTA button -->
                <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                  <tr>
                    <td style="background:#4f46e5;border-radius:10px;">
                      <a href="{reset_link}"
                         style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;
                                font-weight:700;text-decoration:none;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin:0 0 32px;font-size:12px;color:#6366f1;word-break:break-all;">
                  {reset_link}
                </p>

                <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 24px;" />
                <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                  If you didn't request this, you can safely ignore this email —
                  your password will not change.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">
                  © GradMatch AI · This is an automated message, please do not reply.
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """

    params: resend.Emails.SendParams = {
        "from": settings.RESEND_FROM,
        "to": [to_email],
        "subject": "Reset your GradMatch AI password",
        "html": html,
    }
    resend.Emails.send(params)
