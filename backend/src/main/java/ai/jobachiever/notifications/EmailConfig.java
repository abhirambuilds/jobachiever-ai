package ai.jobachiever.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * Spring configuration providing the active EmailProvider.
 * Falls back to SimulatedEmailProvider whenever SMTP is not explicitly enabled,
 * guaranteeing zero external infrastructure dependencies for local dev and tests.
 */
@Configuration
public class EmailConfig {

    private static final Logger log = LoggerFactory.getLogger(EmailConfig.class);

    @Bean
    @ConditionalOnMissingBean(EmailProvider.class)
    public EmailProvider emailProvider(
            @Value("${app.mail.enabled:false}") boolean mailEnabled,
            @Value("${spring.mail.host:}") String smtpHost,
            @Value("${app.mail.from:noreply@jobachiever.ai}") String fromAddress,
            @Value("${app.mail.from-name:JobAchiever AI}") String fromName,
            ObjectProvider<JavaMailSender> mailSenderProvider) {

        if (mailEnabled && smtpHost != null && !smtpHost.isBlank()) {
            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
            if (mailSender != null) {
                log.info("[EMAIL CONFIG] SMTP delivery enabled. Configuring SmtpEmailProvider (host: {}, from: {})",
                        smtpHost, fromAddress);
                return new SmtpEmailProvider(mailSender, fromAddress, fromName);
            } else {
                log.warn("[EMAIL CONFIG] SMTP delivery enabled but JavaMailSender bean unavailable. Falling back to SimulatedEmailProvider.");
            }
        }

        log.info("[EMAIL CONFIG] Email delivery running in SIMULATED mode. No external emails will be dispatched.");
        return new SimulatedEmailProvider();
    }
}
