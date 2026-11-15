package ai.jobachiever.notifications;

/**
 * Pluggable provider interface for email dispatch.
 * Decouples domain logic from specific transport mechanisms (SMTP, API, Simulation).
 */
public interface EmailProvider {

    /**
     * Dispatches the specified email message.
     *
     * @param message the email payload to deliver
     */
    void sendEmail(EmailMessage message);

    /**
     * Identifies the active provider implementation.
     *
     * @return provider name (e.g. SMTP, SIMULATED)
     */
    String getProviderName();
}
