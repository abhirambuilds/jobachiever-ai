package ai.jobachiever.notifications;

/**
 * Immutable value object encapsulating an outgoing email message.
 * Supports dual-format content with rich HTML and plain-text fallback.
 */
public record EmailMessage(
        String to,
        String subject,
        String htmlBody,
        String textBody
) {
    public EmailMessage {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Recipient email address cannot be null or blank");
        }
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("Email subject cannot be null or blank");
        }
    }
}
