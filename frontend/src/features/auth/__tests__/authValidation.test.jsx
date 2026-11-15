import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  evaluatePasswordStrength,
} from '../schemas/authSchemas';

describe('Auth Validation Schemas & Password Strength', () => {
  describe('evaluatePasswordStrength', () => {
    it('returns score 0 for empty password', () => {
      const res = evaluatePasswordStrength('');
      expect(res.score).toBe(0);
      expect(res.metCount).toBe(0);
    });

    it('returns weak score for minimal password', () => {
      const res = evaluatePasswordStrength('short');
      expect(res.score).toBe(1);
      expect(res.label).toBe('Weak');
    });

    it('returns strong score for complex password meeting all requirements', () => {
      const res = evaluatePasswordStrength('SecureP@ssw0rd!');
      expect(res.score).toBe(3);
      expect(res.label).toBe('Strong');
      expect(res.metCount).toBe(5);
    });
  });

  describe('registerSchema', () => {
    const validRegisterData = {
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      password: 'SecureP@ss123!',
      confirmPassword: 'SecureP@ss123!',
      acceptTerms: true,
    };

    it('validates a complete, valid registration form', () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    it('fails when email format is invalid', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true);
    });

    it('fails when passwords do not match', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        confirmPassword: 'DifferentPassword123!',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    });

    it('fails when acceptTerms is false', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        acceptTerms: false,
      });
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.path.includes('acceptTerms'))).toBe(true);
    });

    it('fails when password lacks special characters or numbers', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password: 'PasswordWithoutNumbersOrSymbols',
        confirmPassword: 'PasswordWithoutNumbersOrSymbols',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('validates correct email and password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'bad-email-format',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('otpSchema', () => {
    it('accepts 6-digit numeric OTP', () => {
      const result = otpSchema.safeParse({ otp: '123456' });
      expect(result.success).toBe(true);
    });

    it('rejects non-numeric or wrong length OTP', () => {
      expect(otpSchema.safeParse({ otp: '12345' }).success).toBe(false);
      expect(otpSchema.safeParse({ otp: '1234567' }).success).toBe(false);
      expect(otpSchema.safeParse({ otp: 'abcdef' }).success).toBe(false);
    });
  });

  describe('forgotPasswordSchema and resetPasswordSchema', () => {
    it('validates forgotPassword email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'valid@example.com' }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
    });

    it('validates resetPassword password confirmation', () => {
      const valid = resetPasswordSchema.safeParse({
        password: 'SecureP@ss123!',
        confirmPassword: 'SecureP@ss123!',
      });
      expect(valid.success).toBe(true);

      const mismatch = resetPasswordSchema.safeParse({
        password: 'SecureP@ss123!',
        confirmPassword: 'Mismatch123!',
      });
      expect(mismatch.success).toBe(false);
    });
  });
});
