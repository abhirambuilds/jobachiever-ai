package ai.jobachiever.notifications;

import org.springframework.stereotype.Service;

/**
 * Service responsible for assembling transactional email content
 * including structured HTML and accessible plain-text fallbacks.
 */
@Service
public class EmailTemplateService {

    public EmailMessage createVerificationEmail(String recipientEmail,
                                                String recipientName,
                                                String otp,
                                                int expirationMinutes) {
        String greeting = (recipientName != null && !recipientName.isBlank())
                ? "Hello " + recipientName + ","
                : "Hello,";

        String subject = "Verify your JobAchiever AI Account - " + otp;

        String textBody = String.format("""
                %s

                Thank you for joining JobAchiever AI, your AI-powered Career Operating System.

                Your 6-digit email verification code is: %s

                This code expires in %d minutes.

                If you did not create a JobAchiever AI account, you can safely ignore this email.

                Best regards,
                The JobAchiever AI Team
                """, greeting, otp, expirationMinutes);

        String htmlBody = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>JobAchiever AI Verification</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
                  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="100%%" max-width="560px" style="max-width: 560px; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 36px; text-align: left;">
                          <tr>
                            <td style="padding-bottom: 24px;">
                              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #38bdf8; letter-spacing: -0.5px;">JobAchiever AI</h1>
                              <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Career Operating System</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="color: #cbd5e1; font-size: 15px; line-height: 1.6; padding-bottom: 20px;">
                              <p style="margin: 0 0 16px;">%s</p>
                              <p style="margin: 0 0 24px;">Welcome to JobAchiever AI. Please use the following 6-digit verification code to confirm your email address and activate your account:</p>
                              
                              <div style="background-color: #0f172a; border: 1px solid #38bdf8; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #38bdf8;">%s</span>
                              </div>
                              
                              <p style="margin: 0 0 12px; font-size: 13px; color: #94a3b8;">
                                • This one-time code will expire in <strong>%d minutes</strong>.<br>
                                • For your security, never share this verification code with anyone.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="border-top: 1px solid #334155; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.5;">
                              If you did not initiate this registration request, please disregard this message. Your email address remains secure.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """, greeting, otp, expirationMinutes);

        return new EmailMessage(recipientEmail, subject, htmlBody, textBody);
    }

    public EmailMessage createPasswordResetEmail(String recipientEmail,
                                                String recipientName,
                                                String resetToken,
                                                int expirationMinutes,
                                                String resetBaseUrl) {
        String greeting = (recipientName != null && !recipientName.isBlank())
                ? "Hello " + recipientName + ","
                : "Hello,";

        String cleanBaseUrl = resetBaseUrl.endsWith("/")
                ? resetBaseUrl.substring(0, resetBaseUrl.length() - 1)
                : resetBaseUrl;
        String resetLink = cleanBaseUrl + "?token=" + resetToken;

        String subject = "Reset your JobAchiever AI Password";

        String textBody = String.format("""
                %s

                We received a request to reset your JobAchiever AI password.

                To choose a new password, open the following secure link in your browser:
                %s

                This reset link is valid for %d minutes and can only be used once.

                If you did not request a password reset, you can safely ignore this email; your account remains secure and your password has not been changed.

                Best regards,
                The JobAchiever AI Team
                """, greeting, resetLink, expirationMinutes);

        String htmlBody = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Reset Your JobAchiever AI Password</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
                  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="100%%" max-width="560px" style="max-width: 560px; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 36px; text-align: left;">
                          <tr>
                            <td style="padding-bottom: 24px;">
                              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #38bdf8; letter-spacing: -0.5px;">JobAchiever AI</h1>
                              <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Career Operating System</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="color: #cbd5e1; font-size: 15px; line-height: 1.6; padding-bottom: 20px;">
                              <p style="margin: 0 0 16px;">%s</p>
                              <p style="margin: 0 0 24px;">We received a request to reset the password for your JobAchiever AI account. Click the button below to set a new password:</p>
                              
                              <div style="text-align: center; margin: 28px 0;">
                                <a href="%s" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                                  Reset Password
                                </a>
                              </div>
                              
                              <p style="margin: 0 0 12px; font-size: 13px; color: #94a3b8;">
                                • This link will expire in <strong>%d minutes</strong> and can only be used once.<br>
                                • If the button above does not work, copy and paste this link into your browser:<br>
                                <span style="word-break: break-all; color: #38bdf8; font-size: 12px;">%s</span>
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="border-top: 1px solid #334155; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.5;">
                              If you did not request this password reset, please ignore this email. Your current password will remain unchanged.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """, greeting, resetLink, expirationMinutes, resetLink);

        return new EmailMessage(recipientEmail, subject, htmlBody, textBody);
    }
}
