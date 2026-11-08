import { z } from 'zod';
import { normaliseEmail, trimPassword } from '@/lib/auth/normalise';

/**
 * Task 3 Client Rule Mirror on the Server:
 * 1. Full Name: 3 to 80 characters.
 * 2. Email: RFC 5321 compliant format, max 254 chars, lowercased & trimmed.
 * 3. Phone: 10 to 11 numeric digits (Nigerian mobile standard).
 * 4. Password: 8 to 72 characters, trimmed, case-preserved.
 * 5. Terms: Mandatory explicit acceptance (boolean true).
 */

export const RegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, 'Full name must be at least 3 characters.')
      .max(80, 'Full name must not exceed 80 characters.'),
    email: z
      .string()
      .trim()
      .max(254, 'Email must not exceed 254 characters.')
      .email('Please enter a valid email address.')
      .transform(normaliseEmail),
    phone: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^\d{10,11}$/.test(val),
        'Phone number must be 10 or 11 digits.'
      ),
    password: z
      .string()
      .transform(trimPassword)
      .refine((val) => val.length >= 8, 'Password must be at least 8 characters.')
      .refine((val) => val.length <= 72, 'Password cannot exceed 72 characters (bcrypt ceiling).'),
    confirmPassword: z.string().optional(),
    acceptTerms: z.union([z.boolean(), z.string()]).refine(
      (val) => val === true || val === 'true' || val === 'on',
      'You must accept the Terms and Conditions to register.'
    ),
  })
  .refine(
    (data) => {
      if (data.confirmPassword !== undefined && data.confirmPassword !== null) {
        return data.password === trimPassword(data.confirmPassword);
      }
      return true;
    },
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    }
  );

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .transform(normaliseEmail),
  password: z
    .string()
    .transform(trimPassword)
    .refine((val) => val.length > 0, 'Password is required.')
    .refine((val) => val.length <= 72, 'Password cannot exceed 72 characters.'),
});

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .transform(normaliseEmail),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .transform(trimPassword)
      .refine((val) => val.length >= 8, 'Password must be at least 8 characters.')
      .refine((val) => val.length <= 72, 'Password cannot exceed 72 characters.'),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword !== undefined && data.confirmPassword !== null) {
        return data.password === trimPassword(data.confirmPassword);
      }
      return true;
    },
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    }
  );

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
