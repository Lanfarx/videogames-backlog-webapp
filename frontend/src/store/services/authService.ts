import axios from 'axios';

const API_URL = 'http://localhost:5097/api/Auth'; // Cambia con il tuo endpoint

export const register = (data: {
  email: string;
  password: string;
}) => axios.post(`${API_URL}/register`, data);

export const login = (data: { email: string; password: string }) =>
  axios.post(`${API_URL}/login`, data);