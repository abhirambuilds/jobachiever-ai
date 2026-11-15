package ai.jobachiever.notifications;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

/**
 * Production SMTP email provider backed by Spring Boot's JavaMailSender.
 * Formats HTML and multipart text MIME messages according to RFC standards.
 */
public class SmtpEmailProvider implements EmailProvider {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailProvider.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String fromPersonalName;

    public SmtpEmailProvider(JavaMailSender mailSender, String fromAddress, String fromPersonalName) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.fromPersonalName = fromPersonalName;
    }

    @Override
    public void sendEmail(EmailMessage message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, fromPersonalName));
            helper.setTo(message.to());
            helper.setSubject(message.subject());

            if (message.textBody() != null && message.htmlBody() != null) {
                helper.setText(message.textBody(), message.htmlBody());
            } else if (message.htmlBody() != null) {
                helper.setText(message.htmlBody(), true);
            } else {
                helper.setText(message.textBody(), false);
            }

            mailSender.send(mimeMessage);
            log.info("[SMTP EMAIL] Successfully delivered message to recipient: {} via SMTP", message.to());
        } catch (Exception e) {
            log.error("[SMTP EMAIL] Failed to deliver email to recipient: {} (Error: {})",
                    message.to(), e.getMessage());
            throw new NotificationException("Unable to send email notification. Please try again later.", e);
        }
    }

    @Override
    public String getProviderName() {
        return "SMTP";
    }
}
