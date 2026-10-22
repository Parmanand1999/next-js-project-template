import axiosInstance from '@/lib/axiosInstance';
import { AxiosRequestConfig } from 'axios';

const formatEndpoint = (endpoint: string) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  if (endpoint.startsWith('/api/')) {
    return endpoint;
  }
  return `/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

// GET API call
export const getData = async <T = unknown>(endpoint: string, data: Record<string, unknown> = {}) => {
  return axiosInstance.get<T>(formatEndpoint(endpoint), {
    params: data,
  });
};

// POST API call
export const postData = async <T = unknown>(endpoint: string, data: unknown, config: AxiosRequestConfig = {}) => {
  return axiosInstance.post<T>(formatEndpoint(endpoint), data, config);
};

// PUT API call
export const putData = async <T = unknown>(endpoint: string, data: unknown) => {
  return axiosInstance.put<T>(formatEndpoint(endpoint), data);
};

// PATCH API call
export const patchData = async <T = unknown>(endpoint: string, data: unknown, config: AxiosRequestConfig = {}) => {
  return axiosInstance.patch<T>(formatEndpoint(endpoint), data, config);
};

// DELETE API call
export const deleteData = async <T = unknown>(endpoint: string, data: Record<string, unknown> = {}) => {
  return axiosInstance.delete<T>(formatEndpoint(endpoint), {
    params: data,
  });
};

export const deleteBodyData = async <T = unknown>(endpoint: string, data: unknown = {}) => {
  return axiosInstance.delete<T>(formatEndpoint(endpoint), {
    data,
  });
};
