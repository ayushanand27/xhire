import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Store the getToken function from Clerk
let getTokenFn = null;

export const setClerkToken = (getToken) => {
  getTokenFn = getToken;
};

// Add Clerk token to every request
axiosInstance.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed to get Clerk token:", e);
    }
  }
  return config;
});

export default axiosInstance;
