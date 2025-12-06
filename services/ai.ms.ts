import { supabase } from '@/lib/supabase';
import axios from 'axios';

const API_URL = 'https://isubscribe-ai-microservice.vercel.app/api/v1';
// const API_URL = 'https://869cf3453974.ngrok-free.app/api/v1';
    


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

export { client as microservice };
