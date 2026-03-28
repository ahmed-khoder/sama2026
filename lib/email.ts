import nodemailer from 'nodemailer';

/**
 * Email utility for SAMA Logistics.
 * Uses Gmail SMTP by default. Configure via .env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@samalogistics.com';

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}

/**
 * Send a password reset email with a branded template.
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string, userName?: string) {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f5f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0A1428,#1e3a5f);padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
                    SAMA <span style="color:#F97316;">Logistics</span>
                  </h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 16px;color:#0A1428;font-size:20px;font-weight:700;">
                    إعادة تعيين كلمة المرور
                  </h2>
                  <p style="margin:0 0 8px;color:#64748b;font-size:15px;line-height:1.7;">
                    مرحباً ${userName || ''},
                  </p>
                  <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.7;">
                    تم طلب إعادة تعيين كلمة المرور لحسابك. اضغط على الزر بالأسفل لإنشاء كلمة مرور جديدة.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:8px 0 32px;">
                        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#0369a1,#0ea5e9);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:16px;font-weight:700;box-shadow:0 4px 12px rgba(3,105,161,0.3);">
                          إعادة تعيين كلمة المرور
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;line-height:1.6;">
                    هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.
                  </p>
                  <p style="margin:0 0 24px;color:#94a3b8;font-size:13px;line-height:1.6;">
                    إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.
                  </p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
                  <p style="margin:0;color:#cbd5e1;font-size:11px;">
                    إذا لم يعمل الزر، انسخ الرابط التالي والصقه في المتصفح:
                  </p>
                  <p style="margin:8px 0 0;word-break:break-all;">
                    <a href="${resetUrl}" style="color:#0369a1;font-size:12px;text-decoration:underline;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;color:#94a3b8;font-size:12px;">
                    © ${new Date().getFullYear()} SAMA Logistics — جميع الحقوق محفوظة
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'إعادة تعيين كلمة المرور — SAMA Logistics',
    html,
  });
}
