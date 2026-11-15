package ai.jobachiever;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class JobAchieverApplicationTests {

    @Test
    @DisplayName("Application context loads successfully without database connectivity")
    void contextLoads() {
        // Verifies Spring context initialization and component wiring
    }
}
