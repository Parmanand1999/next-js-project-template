import { getData, postData } from './apiServices';
import { UserProfile } from '@/types/auth';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface LoginResponse {
  data?: UserProfile;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

// 1. Email & Password Login
export const loginWithEmail = (data: LoginPayload) =>
  postData<LoginResponse>('/auth/login', data);

// 2. Mobile Number Login & OTP
export const loginWithMobile = (data: { mobileNumber: string }) =>
  postData('/auth/login/mobile', data);

export const loginWithOtp = (data: { mobileNumber: string; otp: string }) =>
  postData('/auth/login/verifyOTP', data);

// 3. Password Recovery & OTP
export const forgotPasswordApi = (data: { email: string }) =>
  postData<{ message?: string }>('/auth/forgot-password', data);

export const resendOtpApi = (data: { email?: string; mobileNumber?: string }) =>
  postData<{ message?: string }>('/auth/resend-otp', data);

export const resetPasswordApi = (data: {
  email?: string;
  otp?: string;
  token?: string;
  password?: string;
  newPassword?: string;
}) => postData<{ message?: string }>('/auth/reset-password', data);

// 4. Email Verification
export const verifyEmailApi = (token: string) =>
  getData<{ message?: string }>(`/auth/verify-email?token=${token}`);

// 5. Authenticated User Profile
export const getMeApi = () =>
  getData<{ data?: UserProfile }>('/auth/me');
