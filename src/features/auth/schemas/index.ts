import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email ID or Username is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full Name must be at least 2 characters')
      .max(60, 'Full Name cannot exceed 60 characters'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid corporate or personal email address'),
    mobile: z
      .string()
      .min(10, 'Mobile number must be at least 10 digits')
      .regex(/^[0-9+ -]{10,15}$/, 'Please enter a valid phone number'),
    role: z.string().min(1, 'Role is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const forgotPasswordStep1Schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid corporate email address'),
});

export type ForgotPasswordStep1Data = z.infer<typeof forgotPasswordStep1Schema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9!@#$%^&*]/, 'Password must contain at least one number or special symbol'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
