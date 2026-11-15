package ai.jobachiever.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final EmailProvider emailProvider;
    private final EmailTemplateService templateService;
    private final String resetBaseUrl;

    public EmailServiceImpl(EmailProvider emailProvider,
                            EmailTemplateService templateService,
                            @Value("${app.mail.reset-base-url:http://localhost:5173/reset-password}") String resetBaseUrl) {
        this.emailProvider = emailProvider;
        this.templateService = templateService;
        this.resetBaseUrl = resetBaseUrl;
    }

    @Override
    public void sendVerificationOtp(String to, String name, String otp, int expirationMinutes) {
        log.info("Preparing verification email dispatch for recipient: {}", to);
        EmailMessage message = templateService.createVerificationEmail(to, name, otp, expirationMinutes);
        emailProvider.sendEmail(message);
    }

    @Override
    public void sendPasswordReset(String to, String name, String resetToken, int expirationMinutes) {
        log.info("Preparing password reset email dispatch for recipient: {}", to);
        EmailMessage message = templateService.createPasswordResetEmail(to, name, resetToken, expirationMinutes, resetBaseUrl);
        emailProvider.sendEmail(message);
    }

    @Override
    public void sendCustomEmail(EmailMessage message) {
        emailProvider.sendEmail(message);
    }
}
