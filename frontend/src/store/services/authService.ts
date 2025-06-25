import axios from 'axios';
import { API_CONFIG, buildApiUrl } from '../../config/api';

const API_URL = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH);

export const register = (data: {
  email: string;
  password: string;
  UserName: string;
  tags: string;
}) => axios.post(`${API_URL}/register`, data);

export const login = (data: { identifier: string; password: string }) =>
  axios.post(`${API_URL}/login`, data);

export const forgotPassword = (data: { email: string }) =>
  axios.post(`${API_URL}/forgot-password`, data);

export const resetPassword = (data: { email: string; token: string; newPassword: string }) =>
  axios.post(`${API_URL}/reset-password`, data);