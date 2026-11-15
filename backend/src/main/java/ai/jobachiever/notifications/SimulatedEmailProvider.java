package ai.jobachiever.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicReference;

/**
 * Safe local development and testing email provider.
 * Logs high-level dispatch metadata without exposing confidential OTPs,
 * reset tokens, or credentials to server logs.
 */
public class SimulatedEmailProvider implements EmailProvider {

    private static final Logger log = LoggerFactory.getLogger(SimulatedEmailProvider.class);

    private final AtomicReference<EmailMessage> lastDeliveredMessage = new AtomicReference<>();

    @Override
    public void sendEmail(EmailMessage message) {
        lastDeliveredMessage.set(message);
        // Security rule: Never log message body or plain tokens/OTPs
        log.info("[SIMULATED EMAIL] Simulated delivery dispatched -> Recipient: {} | Subject: '{}'",
                message.to(), message.subject());
    }

    @Override
    public String getProviderName() {
        return "SIMULATED";
    }

    public EmailMessage getLastDeliveredMessage() {
        return lastDeliveredMessage.get();
    }

    public void clear() {
        lastDeliveredMessage.set(null);
    }
}
