import { getData, postData, putData } from './apiServices';
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

export interface ProfileDetails {
  _id?: string;
  firstName?: string;
  lastName?: string;
  bloodGroup?: string;
  profilePhoto?: string[];
  email?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  contactNumber?: string;
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

// 5. Authenticated User Profile & Identity
export const getMeApi = () =>
  getData<{ data?: UserProfile }>('/auth/me');

// 6. Profile Management APIs
export const getProfileApi = () =>
  getData<{ data?: ProfileDetails | ProfileDetails[] }>('/userInfo/get');

export const addProfileApi = (data: ProfileDetails) =>
  postData<{ data?: ProfileDetails }>('/userInfo/add', data);

export const updateProfileApi = (data: ProfileDetails) =>
  putData<{ data?: ProfileDetails }>('/userInfo/update', data);

export const uploadFaceIndexApi = (formData: FormData) =>
  postData<{ filePath?: string; data?: { filePath?: string } }>(
    '/uploadFile/faceIndexes',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
