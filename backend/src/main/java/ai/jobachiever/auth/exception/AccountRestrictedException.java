package ai.jobachiever.auth.exception;

public class AccountRestrictedException extends RuntimeException {

    public AccountRestrictedException(String message) {
        super(message);
    }
}
