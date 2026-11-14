/**
 * Authentication Service Interface for JobAchiever AI.
 *
 * This module defines the API client boundaries for Spring Boot 3.x backend endpoints
 * under /api/v1/auth. During this frontend milestone, asynchronous simulated handlers
 * mirror the expected Spring Boot response contracts without fabricating real credentials.
 */

export const AUTH_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const authService = {
  /**
   * Registers a new user account in Spring Boot.
   * Target endpoint: POST /api/v1/auth/register
   */
  async register(data) {
    // Simulated network delay for UI responsiveness validation
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      message: 'Registration initiated. Verification OTP required.',
      email: data.email,
      isSimulated: true,
    };
  },

  /**
   * Authenticates user credentials with Spring Boot JWT provider.
   * Target endpoint: POST /api/v1/auth/login
   */
  async login(credentials) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      message: 'Login simulation successful.',
      user: {
        email: credentials.email,
        name: 'Demo User',
      },
      isSimulated: true,
    };
  },

  /**
   * Validates a 6-digit email OTP.
   * Target endpoint: POST /api/v1/auth/verify-otp
   */
  async verifyOtp({ email, otp }) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    // Accept standard test OTP or any 6 digits in demo mode
    if (otp === '000000') {
      throw new Error('Invalid or expired verification code. Please request a new one.');
    }
    return {
      success: true,
      email,
      message: 'Email successfully verified.',
      isSimulated: true,
    };
  },

  /**
   * Triggers a new OTP delivery via Spring Boot email service.
   * Target endpoint: POST /api/v1/auth/resend-otp
   */
  async resendOtp(email) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      message: `A new 6-digit code has been prepared for ${email}.`,
      isSimulated: true,
    };
  },

  /**
   * Requests a password recovery link.
   * Target endpoint: POST /api/v1/auth/forgot-password
   */
  async forgotPassword(email) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      success: true,
      message: 'If an account exists for this email, password reset instructions have been prepared.',
      email,
      isSimulated: true,
    };
  },

  /**
   * Resets the user password using a verified token.
   * Target endpoint: POST /api/v1/auth/reset-password
   */
  async resetPassword({ _token, _newPassword }) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      message: 'Password successfully updated.',
      isSimulated: true,
    };
  },
};
