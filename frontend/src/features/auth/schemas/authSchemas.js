import { z } from 'zod';

export const passwordRequirementsRegex = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

export function evaluatePasswordStrength(password = '') {
  const requirements = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'One uppercase letter (A-Z)', met: passwordRequirementsRegex.upper.test(password) },
    { id: 'lower', label: 'One lowercase letter (a-z)', met: passwordRequirementsRegex.lower.test(password) },
    { id: 'number', label: 'One number (0-9)', met: passwordRequirementsRegex.number.test(password) },
    { id: 'special', label: 'One special symbol (!@#$...)', met: passwordRequirementsRegex.special.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  let score = 0;
  let label = 'Too Short';
  let color = 'bg-muted';

  if (password.length > 0) {
    if (metCount <= 2) {
      score = 1;
      label = 'Weak';
      color = 'bg-rose-500';
    } else if (metCount === 3 || metCount === 4) {
      score = 2;
      label = 'Fair';
      color = 'bg-amber-500';
    } else if (metCount === 5) {
      score = 3;
      label = 'Strong';
      color = 'bg-emerald-500';
    }
  }

  return { requirements, metCount, score, label, color };
}

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: 'Full name must be at least 2 characters' })
      .max(60, { message: 'Full name cannot exceed 60 characters' }),
    email: z
      .string()
      .trim()
      .email({ message: 'Please provide a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(passwordRequirementsRegex.upper, { message: 'Must contain an uppercase letter' })
      .regex(passwordRequirementsRegex.lower, { message: 'Must contain a lowercase letter' })
      .regex(passwordRequirementsRegex.number, { message: 'Must contain a number' })
      .regex(passwordRequirementsRegex.special, { message: 'Must contain a special character' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must acknowledge the terms and privacy policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please provide a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: 'Verification code must be exactly 6 digits' })
    .regex(/^\d{6}$/, { message: 'Verification code must contain only numbers' }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please provide a valid email address' }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(passwordRequirementsRegex.upper, { message: 'Must contain an uppercase letter' })
      .regex(passwordRequirementsRegex.lower, { message: 'Must contain a lowercase letter' })
      .regex(passwordRequirementsRegex.number, { message: 'Must contain a number' })
      .regex(passwordRequirementsRegex.special, { message: 'Must contain a special character' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
