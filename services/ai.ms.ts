import { supabase } from '@/lib/supabase';
import axios from 'axios';

const API_URL = 'https://0658-102-91-93-6.ngrok-free.app/api/v1';
    // process.env.NEXT_PUBLIC_AI_MS_API_URL || 
    


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