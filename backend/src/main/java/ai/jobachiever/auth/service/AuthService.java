package ai.jobachiever.auth.service;

import ai.jobachiever.auth.dto.AuthResponse;
import ai.jobachiever.auth.dto.LoginRequest;
import ai.jobachiever.auth.dto.RegisterRequest;
import ai.jobachiever.auth.dto.UserResponse;

import java.util.UUID;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(UUID userId);

    void logout(String rawToken, UUID userId);
}
