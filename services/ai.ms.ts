import { supabase } from '@/lib/supabase';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_AI_MS_API_URL || 'http://127.0.0.1:8000/api/v1';


const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  async (config) => {

    const token = (await supabase.auth.getSession()).data?.session?.access_token || null;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {

        return client(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

client.defaults.xsrfHeaderName = 'x-csrftoken';
client.defaults.xsrfCookieName = 'csrftoken';
client.defaults.withCredentials = true;

export { client as microservice }